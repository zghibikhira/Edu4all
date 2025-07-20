const mongoose = require('mongoose');
const User = require('./user');

// Schéma spécifique aux enseignants
const teacherSchema = new mongoose.Schema({
  // Matières enseignées
  subjects: [{ 
    type: String,
    required: true
  }],
  
  // Formation et diplômes
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number },
    country: String,
    description: String
  }],
  
  // Expérience professionnelle
  experience: { 
    type: Number, 
    default: 0 
  },
  
  // Évaluations et notes
  rating: { 
    type: Number, 
    default: 0 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  },
  reviews: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Rang et certifications
  rank: { 
    type: String, 
    enum: ['Prof', 'Superprof', 'Hyperprof'],
    default: 'Prof'
  },
  certifications: [{
    name: String,
    issuer: String,
    dateObtained: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  
  // Disponibilité
  availability: {
    schedule: [{
      day: { 
        type: String, 
        enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] 
      },
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }],
    timezone: { type: String, default: 'Europe/Paris' },
    maxStudentsPerSession: { type: Number, default: 10 },
    sessionDuration: { type: Number, default: 60 } // en minutes
  },
  
  // Méthodes d'enseignement
  teachingMethods: [{
    name: String,
    description: String,
    isActive: { type: Boolean, default: true }
  }],
  
  // Matériel pédagogique
  teachingMaterials: [{
    title: String,
    description: String,
    fileType: { 
      type: String, 
      enum: ['pdf', 'video', 'image', 'document', 'presentation'] 
    },
    fileUrl: String,
    cloudinaryId: String,
    uploadedAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: false }
  }],
  
  // Cours créés
  courses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    title: String,
    status: { 
      type: String, 
      enum: ['brouillon', 'actif', 'inactif'],
      default: 'brouillon'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Évaluations créées
  evaluations: [{
    evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation' },
    title: String,
    subject: String,
    totalStudents: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Statistiques
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageSessionRating: { type: Number, default: 0 }
  },
  
  // Paramètres de paiement
  paymentSettings: {
    hourlyRate: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' },
    paymentMethods: [{ type: String }],
    bankInfo: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      swiftCode: String
    }
  }
}, {
  timestamps: true
});

// Méthodes d'instance
teacherSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / this.reviews.length;
};

teacherSchema.methods.getActiveCourses = function() {
  return this.courses.filter(course => course.status === 'actif');
};

teacherSchema.methods.getTotalStudents = function() {
  return this.stats.totalStudents;
};

teacherSchema.methods.updateRank = function() {
  const rating = this.calculateAverageRating();
  const experience = this.experience;
  const totalStudents = this.getTotalStudents();
  
  if (rating >= 4.8 && experience >= 5 && totalStudents >= 100) {
    this.rank = 'Hyperprof';
  } else if (rating >= 4.5 && experience >= 2 && totalStudents >= 50) {
    this.rank = 'Superprof';
  } else {
    this.rank = 'Prof';
  }
  
  return this.save();
};

// Index pour les recherches
teacherSchema.index({ 'subjects': 1 });
teacherSchema.index({ 'rating': -1 });
teacherSchema.index({ 'availability.schedule.day': 1 });

module.exports = mongoose.model('Teacher', teacherSchema); 