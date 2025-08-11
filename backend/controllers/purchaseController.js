const Purchase = require('../models/purchase');
const Course = require('../models/course');
const Wallet = require('../models/wallet');

// Obtenir les achats d'un utilisateur
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };
    
    if (status) {
      options.status = status;
    }
    
    const purchases = await Purchase.findUserPurchases(userId, options);
    
    res.json({
      success: true,
      data: {
        purchases: purchases,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur getUserPurchases:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des achats'
    });
  }
};

// Vérifier si un utilisateur a acheté un cours
const checkCoursePurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, type = 'full_course' } = req.params;
    
    const purchase = await Purchase.hasUserPurchased(userId, courseId, type);
    
    res.json({
      success: true,
      data: {
        hasPurchased: !!purchase,
        purchase: purchase
      }
    });
  } catch (error) {
    console.error('Erreur checkCoursePurchase:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'achat'
    });
  }
};

// Télécharger un fichier acheté
const downloadPurchasedFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, fileId } = req.params;
    
    // Vérifier que l'utilisateur a acheté le cours
    const purchase = await Purchase.hasUserPurchased(userId, courseId);
    
    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez acheter ce cours pour télécharger ses fichiers'
      });
    }
    
    // Trouver le fichier dans l'achat
    const purchasedFile = purchase.purchasedFiles.find(
      file => file.fileId.toString() === fileId
    );
    
    if (!purchasedFile) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé dans vos achats'
      });
    }
    
    // Vérifier que l'utilisateur peut télécharger
    if (!purchase.canDownload()) {
      return res.status(403).json({
        success: false,
        message: 'Votre accès à ce cours a expiré'
      });
    }
    
    // Incrémenter le compteur de téléchargements
    await purchase.incrementDownloadCount(fileId);
    
    // Si c'est une URL externe (Cloudinary, etc.), rediriger
    if (purchasedFile.fileUrl.startsWith('http')) {
      return res.redirect(purchasedFile.fileUrl);
    }
    
    // Si c'est un fichier local, le servir
    const path = require('path');
    const fs = require('fs');
    
    const filePath = path.join(__dirname, '..', 'uploads', purchasedFile.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }
    
    // Définir les headers pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${purchasedFile.originalName}"`);
    res.setHeader('Content-Type', purchasedFile.fileType || 'application/octet-stream');
    
    // Créer un stream de lecture et l'envoyer
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erreur downloadPurchasedFile:', error);
    res.status(500).json({
      success: false,
        message: 'Erreur lors du téléchargement'
    });
  }
};

// Obtenir les statistiques d'achat d'un utilisateur
const getPurchaseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalPurchases = await Purchase.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    
    const totalSpent = await Purchase.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const recentPurchases = await Purchase.findUserPurchases(userId, { limit: 5 });
    
    res.json({
      success: true,
      data: {
        totalPurchases: totalPurchases,
        totalSpent: totalSpent[0]?.total || 0,
        recentPurchases: recentPurchases
      }
    });
  } catch (error) {
    console.error('Erreur getPurchaseStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Demander un remboursement
const requestRefund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { purchaseId, reason } = req.body;
    
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      user: userId,
      status: 'completed'
    });
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Achat non trouvé'
      });
    }
    
    // Vérifier si le remboursement est possible (ex: dans les 30 jours)
    const daysSincePurchase = Math.floor(
      (new Date() - new Date(purchase.purchasedAt)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSincePurchase > 30) {
      return res.status(400).json({
        success: false,
        message: 'Le délai de remboursement de 30 jours est dépassé'
      });
    }
    
    // Marquer l'achat comme remboursé
    purchase.status = 'refunded';
    purchase.refundedAt = new Date();
    await purchase.save();
    
    // Si le paiement était par wallet, rembourser le wallet
    if (purchase.paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        const transaction = {
          type: 'refund',
          amount: purchase.amount,
          currency: purchase.currency,
          description: `Remboursement: ${purchase.relatedCourse ? 'Cours' : 'Achat'}`,
          status: 'completed',
          paymentMethod: 'wallet',
          relatedCourse: purchase.course,
          processedAt: new Date()
        };
        
        await wallet.addTransaction(transaction);
      }
    }
    
    res.json({
      success: true,
      message: 'Remboursement effectué avec succès',
      data: {
        purchase: purchase
      }
    });
  } catch (error) {
    console.error('Erreur requestRefund:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du remboursement'
    });
  }
};

// Acheter un cours (PDF ou autre)
const purchaseCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // 1. Check if already purchased
    const alreadyPurchased = await Purchase.hasUserPurchased(userId, courseId);
    if (alreadyPurchased) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà acheté ce cours.' });
    }

    // 2. Get course info
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Cours introuvable.' });
    }
    if (course.settings.enrollmentType !== 'payant') {
      return res.status(400).json({ success: false, message: 'Ce cours n\'est pas à vendre.' });
    }

    // 3. Handle payment (example: wallet only, adapt for Stripe/PayPal)
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < course.settings.price) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant.' });
    }
    wallet.balance -= course.settings.price;
    await wallet.save();

    // 4. Record purchase
    const purchase = new Purchase({
      user: userId,
      course: courseId,
      amount: course.settings.price,
      currency: course.settings.currency,
      status: 'completed',
      purchasedFiles: course.files.map(f => ({
        fileId: f._id,
        fileUrl: f.fileUrl,
        originalName: f.originalName,
        fileType: f.fileType
      })),
      purchasedAt: new Date()
    });
    await purchase.save();

    res.json({ success: true, message: 'Achat réussi !', data: { purchase } });
  } catch (error) {
    console.error('Erreur purchaseCourse:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'achat.' });
  }
};

// Acheter plusieurs cours (panier)
const purchaseCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseIds } = req.body; // array of course IDs

    // 1. Fetch all courses
    const courses = await Course.find({ _id: { $in: courseIds } });

    // 2. Calculate total price
    let total = 0;
    let purchases = [];
    for (const course of courses) {
      if (course.settings.enrollmentType === 'payant') {
        total += course.settings.price;
      }
    }

    // 3. Check wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet || wallet.balance < total) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant.' });
    }

    // 4. Deduct and record purchases
    wallet.balance -= total;
    await wallet.save();

    for (const course of courses) {
      // Skip if already purchased
      const alreadyPurchased = await Purchase.hasUserPurchased(userId, course._id);
      if (alreadyPurchased) continue;

      const purchase = new Purchase({
        user: userId,
        course: course._id,
        amount: course.settings.price,
        currency: course.settings.currency,
        status: 'completed',
        purchasedFiles: course.files.map(f => ({
          fileId: f._id,
          fileUrl: f.fileUrl,
          originalName: f.originalName,
          fileType: f.fileType
        })),
        purchasedAt: new Date()
      });
      await purchase.save();
      purchases.push(purchase);
    }

    res.json({ success: true, message: 'Achat du panier réussi !', data: { purchases } });
  } catch (error) {
    console.error('Erreur purchaseCart:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'achat du panier.' });
  }
};

module.exports = {
  getUserPurchases,
  checkCoursePurchase,
  downloadPurchasedFile,
  getPurchaseStats,
  requestRefund,
  purchaseCourse,
  purchaseCart
}; 