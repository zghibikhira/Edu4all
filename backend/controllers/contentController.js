const Purchase = require('../models/purchase');
const Course = require('../models/course');
const cloudinary = require('cloudinary').v2;

// GET /api/content/course/:courseId/pdf
// Endpoint sécurisé pour accéder aux PDFs d'un cours acheté
exports.getCoursePdf = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    
    // Vérifier que l'utilisateur a acheté le cours
    const purchase = await Purchase.hasUserPurchased(userId, courseId);
    
    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez acheter ce cours pour accéder à ses ressources'
      });
    }
    
    // Vérifier que l'utilisateur peut accéder
    if (!purchase.canDownload()) {
      return res.status(403).json({
        success: false,
        message: 'Votre accès à ce cours a expiré'
      });
    }
    
    // Trouver les fichiers PDF du cours
    const pdfFiles = purchase.purchasedFiles.filter(file => 
      file.fileType === 'pdf' || file.originalName.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun fichier PDF trouvé pour ce cours'
      });
    }
    
    // Générer des URLs signées pour chaque PDF
    const pdfUrls = await Promise.all(pdfFiles.map(async (file) => {
      try {
        if (file.cloudinaryId) {
          // Générer une URL signée Cloudinary
          const signedUrl = cloudinary.url(file.cloudinaryId, {
            sign_url: true,
            type: 'authenticated',
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 heure
            attachment: true,
            filename: file.originalName
          });
          
          return {
            fileId: file.fileId,
            filename: file.originalName,
            downloadUrl: signedUrl,
            expiresAt: new Date(Date.now() + 3600 * 1000),
            downloadCount: file.downloadCount
          };
        } else if (file.fileUrl.startsWith('http')) {
          // URL externe directe
          return {
            fileId: file.fileId,
            filename: file.originalName,
            downloadUrl: file.fileUrl,
            downloadCount: file.downloadCount
          };
        } else {
          // Fichier local - générer une URL de téléchargement sécurisée
          return {
            fileId: file.fileId,
            filename: file.originalName,
            downloadUrl: `/api/purchases/download/${courseId}/${file.fileId}`,
            downloadCount: file.downloadCount
          };
        }
      } catch (error) {
        console.error('Erreur génération URL pour fichier:', file.fileId, error);
        return null;
      }
    }));
    
    // Filtrer les URLs qui ont échoué
    const validPdfUrls = pdfUrls.filter(url => url !== null);
    
    res.json({
      success: true,
      data: {
        courseId,
        pdfFiles: validPdfUrls,
        totalFiles: validPdfUrls.length,
        accessGranted: true,
        expiresAt: purchase.accessExpiresAt
      }
    });
    
  } catch (error) {
    console.error('Erreur getCoursePdf:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des PDFs'
    });
  }
};

// GET /api/content/course/:courseId/access
// Vérifier l'accès à un cours et retourner les métadonnées
exports.checkCourseAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    
    // Vérifier que l'utilisateur a acheté le cours
    const purchase = await Purchase.hasUserPurchased(userId, courseId);
    
    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - cours non acheté',
        data: {
          hasAccess: false,
          canDownload: false
        }
      });
    }
    
    const canDownload = purchase.canDownload();
    
    res.json({
      success: true,
      data: {
        hasAccess: true,
        canDownload,
        purchase: {
          id: purchase._id,
          purchasedAt: purchase.purchasedAt,
          accessExpiresAt: purchase.accessExpiresAt,
          status: purchase.status
        },
        course: purchase.course
      }
    });
    
  } catch (error) {
    console.error('Erreur checkCourseAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification d\'accès'
    });
  }
};

// POST /api/content/course/:courseId/download/:fileId
// Télécharger un fichier spécifique avec tracking
exports.downloadCourseFile = async (req, res) => {
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
    
    // Vérifier que l'utilisateur peut télécharger
    if (!purchase.canDownload()) {
      return res.status(403).json({
        success: false,
        message: 'Votre accès à ce cours a expiré'
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
    
    // Incrémenter le compteur de téléchargements
    await purchase.incrementDownloadCount(fileId);
    
    // Générer une URL signée sécurisée
    try {
      if (purchasedFile.cloudinaryId) {
        const signedUrl = cloudinary.url(purchasedFile.cloudinaryId, {
          sign_url: true,
          type: 'authenticated',
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 heure
          attachment: true,
          filename: purchasedFile.originalName
        });
        
        return res.json({
          success: true,
          data: {
            downloadUrl: signedUrl,
            filename: purchasedFile.originalName,
            expiresAt: new Date(Date.now() + 3600 * 1000),
            downloadCount: purchasedFile.downloadCount + 1
          }
        });
      }
      
      // Fallback pour les autres types de fichiers
      return res.json({
        success: true,
        data: {
          downloadUrl: purchasedFile.fileUrl,
          filename: purchasedFile.originalName,
          downloadCount: purchasedFile.downloadCount + 1
        }
      });
      
    } catch (cloudinaryError) {
      console.error('Erreur Cloudinary:', cloudinaryError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du lien de téléchargement'
      });
    }
    
  } catch (error) {
    console.error('Erreur downloadCourseFile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement'
    });
  }
};
