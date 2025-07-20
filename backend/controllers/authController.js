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
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
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

    // Vérifier si le compte est verrouillé
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Compte temporairement verrouillé. Réessayez plus tard.'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
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

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer le token JWT
    const token = generateToken(user._id);

    // Retourner la réponse
    res.json({
      success: true,
      message: 'Connexion réussie !',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
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
      message: 'Erreur serveur lors de la connexion'
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
