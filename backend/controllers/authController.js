const User = require('../models/user');
const Stats = require('../models/stats');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = '7d';

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId, id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Validation des données d'inscription
const validateRegistrationData = (data) => {
  const errors = [];
  
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('Le prénom doit contenir au moins 2 caractères');
  }
  
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email invalide');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  if (!data.role || !['etudiant', 'enseignant'].includes(data.role)) {
    errors.push('Rôle invalide');
  }
  
  if (!data.termsAccepted || !data.privacyAccepted) {
    errors.push('Vous devez accepter les conditions d\'utilisation et la politique de confidentialité');
  }
  
  // Validation spécifique aux étudiants
  if (data.role === 'etudiant') {
    if (!data.studentInfo?.level) {
      errors.push('Le niveau scolaire est requis pour les étudiants');
    }
  }
  
  // Validation spécifique aux enseignants
  if (data.role === 'enseignant') {
    if (!data.teacherInfo?.subjects || data.teacherInfo.subjects.length === 0) {
      errors.push('Au moins une matière est requise pour les enseignants');
    }
  }
  
  return errors;
};

// Inscription utilisateur
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      studentInfo,
      teacherInfo,
      termsAccepted,
      privacyAccepted
    } = req.body;

    // Validation des données
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationErrors
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      termsAccepted,
      privacyAccepted
    };

    // Ajouter les informations spécifiques au rôle
    if (role === 'etudiant' && studentInfo) {
      userData.studentInfo = studentInfo;
    } else if (role === 'enseignant' && teacherInfo) {
      userData.teacherInfo = teacherInfo;
    }

    const user = new User(userData);
    await user.save();

    // Générer OTP email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: envoyer otp par email (stub)
    console.log('OTP (dev only):', otp);

    // Mettre à jour les statistiques globales
    await updateGlobalStats(role);

    // Générer le token JWT
    const token = generateToken(user._id);

    // Retourner la réponse
    res.status(201).json({
      success: true,
      message: 'Inscription réussie !',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier l'état du compte
    if (user.isDeleted) {
      return res.status(401).json({ success: false, message: 'Compte supprimé' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }
    if (user.status === 'BANNED') {
      return res.status(401).json({ success: false, message: 'Compte banni' });
    }
    // Vérifier si le compte est verrouillé
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Compte temporairement verrouillé. Réessayez plus tard.'
      });
    }

    // Vérifier le mot de passe (garder safe si hash manquant)
    if (!user.password || typeof user.password !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Compte invalide: mot de passe manquant. Veuillez réinitialiser votre mot de passe.'
      });
    }
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (e) {
      console.error('bcrypt compare failed:', e.message);
      return res.status(401).json({
        success: false,
        message: 'Format de mot de passe invalide sur le compte. Réinitialisez le mot de passe.'
      });
    }
    if (!isPasswordValid) {
      // Incrémenter les tentatives de connexion
      await user.incrementLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Réinitialiser les tentatives de connexion
    await user.resetLoginAttempts();

    // Mettre à jour la dernière connexion sans valider tout le schéma
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date(), updatedAt: new Date() }, $unset: { lockUntil: 1 } });

    // Générer le token JWT
    const token = generateToken(user._id);

    // Retourner la réponse (normaliser rôle pour front)
    res.json({
      success: true,
      message: 'Connexion réussie !',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: (user.role === 'teacher') ? 'enseignant' : (user.role === 'student') ? 'etudiant' : user.role,
          isVerified: user.isVerified,
          avatar: user.avatar
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: `Erreur serveur lors de la connexion: ${error.message}`
    });
  }
};

// Obtenir le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Admin: list users with filters
exports.adminListUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès administrateur requis' });
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'banned') filter.status = 'BANNED';
    if (status === 'suspended') filter.suspendedAt = { $ne: null };
    const users = await User.find(filter).select('firstName lastName email role isActive status createdAt');
    return res.json({ success: true, data: users });
  } catch (e) {
    console.error('adminListUsers error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar, studentInfo, teacherInfo } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (studentInfo) updateData.studentInfo = studentInfo;
    if (teacherInfo) updateData.teacherInfo = teacherInfo;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Teacher requests account deletion (RGPD)
exports.requestDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('role isDeleted deletion stats');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (user.isDeleted) return res.status(400).json({ success: false, message: 'Suppression déjà en cours' });

    // Block if teacher has balance, disputes or scheduled sessions
    if (user.role === 'enseignant') {
      const Wallet = require('../models/wallet');
      const Complaint = require('../models/complaint');
      const Session = require('../models/session');
      const wallet = await Wallet.findOne({ user: user._id });
      const hasBalance = wallet && wallet.balance > 0;
      const openDisputes = await Complaint.countDocuments({ againstUserId: user._id, status: { $in: ['NEW','UNDER_REVIEW','ESCALATED'] } });
      const scheduledSessions = await Session.countDocuments({ teacherId: user._id, date: { $gte: new Date() }, status: { $in: ['scheduled','ongoing'] } });
      if (hasBalance || openDisputes > 0 || scheduledSessions > 0) {
        return res.status(400).json({ success: false, message: 'Impossible de supprimer: solde non nul, litiges ouverts, ou sessions planifiées' });
      }
    }

    const retentionDays = parseInt(process.env.DELETION_RETENTION_DAYS || '30');
    const scheduledAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

    user.isDeleted = true;
    user.deletion = { requestedAt: new Date(), scheduledAt, byAdmin: false };
    await user.save();

    return res.json({ success: true, message: 'Suppression planifiée', data: { scheduledAt } });
  } catch (e) {
    console.error('requestDeletion error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Admin forces deletion
exports.adminForceDelete = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    user.isDeleted = true;
    user.deletion = { requestedAt: user.deletion?.requestedAt || new Date(), scheduledAt: new Date(), processedAt: new Date(), byAdmin: true, reason: req.body?.reason };
    await user.save();

    // Optionally anonymize or export here (placeholder)
    return res.json({ success: true, message: 'Suppression forcée enregistrée' });
  } catch (e) {
    console.error('adminForceDelete error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Admin deletion queue (users scheduled for deletion)
exports.getDeletionQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { isDeleted: true };
    const users = await User.find(filter).select('firstName lastName email role deletion').sort({ 'deletion.scheduledAt': 1 }).limit(parseInt(limit)).skip((parseInt(page)-1)*parseInt(limit));
    const total = await User.countDocuments(filter);
    return res.json({ success: true, data: { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total/parseInt(limit)) } } });
  } catch (e) {
    console.error('getDeletionQueue error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Déconnexion (côté client - invalider le token)
exports.logout = async (req, res) => {
  try {
    // En production, vous pourriez ajouter le token à une liste noire
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Réinitialisation du mot de passe
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte associé à cet email'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Pour le moment, on retourne le token (en production, envoyer par email)
    
    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé',
      data: { resetToken } // À supprimer en production
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token et nouveau mot de passe requis'
      });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Demander renvoi OTP email
exports.resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.createHash('sha256').update(otp).digest('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log('OTP (dev only):', otp);
    return res.json({ success: true, message: 'OTP renvoyé' });
  } catch (e) {
    console.error('resendEmailOtp error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Vérifier OTP email
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email et OTP requis' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    const token = crypto.createHash('sha256').update(otp).digest('hex');
    if (!user.emailVerificationToken || user.emailVerificationToken !== token || (user.emailVerificationExpires && user.emailVerificationExpires < Date.now())) {
      return res.status(400).json({ success: false, message: 'OTP invalide ou expiré' });
    }
    user.emailVerified = true;
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.json({ success: true, message: 'Email vérifié' });
  } catch (e) {
    console.error('verifyEmailOtp error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Fonction utilitaire pour mettre à jour les statistiques globales
const updateGlobalStats = async (role) => {
  try {
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats();
    }

    stats.totalUsers += 1;
    if (role === 'etudiant') {
      stats.totalStudents += 1;
    } else if (role === 'enseignant') {
      stats.totalTeachers += 1;
    }

    // Mettre à jour les statistiques quotidiennes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyStat = stats.dailyStats.find(stat => 
      stat.date.getTime() === today.getTime()
    );

    if (dailyStat) {
      dailyStat.newUsers += 1;
    } else {
      stats.dailyStats.push({
        date: today,
        newUsers: 1,
        newCourses: 0,
        activeUsers: 0,
        revenue: 0
      });
    }

    stats.lastUpdated = new Date();
    await stats.save();
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
  }
};

// Obtenir les statistiques globales
exports.getGlobalStats = async (req, res) => {
  try {
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats();
      await stats.save();
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
