const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Informations de base
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['etudiant', 'enseignant', 'admin'], 
    required: true,
    default: 'etudiant'
  },
  
  // Informations personnelles
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  phone: { 
    type: String,
    trim: true
  },
  avatar: { 
    type: String,
    default: null
  },
  
  // Informations spécifiques aux étudiants
  studentInfo: {
    level: { 
      type: String, 
      enum: ['primaire', 'college', 'lycee', 'superieur'],
      required: function() { return this.role === 'etudiant'; }
    },
    languages: [{ 
      type: String 
    }],
    accessibility: {
      hasDisability: { type: Boolean, default: false },
      needs: [{ type: String }]
    }
  },
  
  // Informations spécifiques aux enseignants
  teacherInfo: {
    subjects: [{ 
      type: String 
    }],
    education: {
      degree: { type: String },
      institution: { type: String },
      year: { type: Number }
    },
    experience: { 
      type: Number, 
      default: 0 
    },
    rating: { 
      type: Number, 
      default: 0 
    },
    totalReviews: { 
      type: Number, 
      default: 0 
    },
    followersCount: {
      type: Number,
      default: 0
    },
    postsCount: {
      type: Number,
      default: 0
    },
    rank: { 
      type: String, 
      enum: ['Prof', 'Superprof', 'Hyperprof'],
      default: 'Prof'
    },
    availability: {
      schedule: [{
        day: { type: String, enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] },
        startTime: String,
        endTime: String
      }],
      timezone: { type: String, default: 'Europe/Paris' }
    }
  },
  
  // Statut et vérification
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  phoneVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Acceptation des conditions
  termsAccepted: { 
    type: Boolean, 
    default: false 
  },
  privacyAccepted: { 
    type: Boolean, 
    default: false 
  },
  
  // Statistiques
  stats: {
    totalCourses: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 0 }
  },
  
  // Sécurité
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Date 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Modération
  bannedAt: Date,
  bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  banReason: String,
  suspendedAt: Date,
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  suspensionReason: String,
  suspensionExpiresAt: Date,
  
  // Métadonnées
  lastLogin: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index pour les recherches
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'teacherInfo.subjects': 1 });
userSchema.index({ 'studentInfo.level': 1 });

// Méthodes virtuelles
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Méthodes d'instance
userSchema.methods.incrementLoginAttempts = function() {
  // Si on a un verrou précédent qui a expiré
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Verrouiller le compte après 5 tentatives
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 heures
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

module.exports = mongoose.model('User', userSchema);
