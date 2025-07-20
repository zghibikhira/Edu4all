const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Informations de base
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  shortDescription: { 
    type: String, 
    maxlength: 200 
  },
  
  // Instructeur
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Catégorie et matières
  category: { 
    type: String, 
    required: true 
  },
  subjects: [{ 
    type: String, 
    required: true 
  }],
  level: { 
    type: String, 
    enum: ['debutant', 'intermediaire', 'avance'],
    default: 'debutant'
  },
  
  // Contenu du cours
  content: {
    objectives: [{ type: String }],
    prerequisites: [{ type: String }],
    materials: [{ type: String }],
    duration: { type: Number }, // en heures
    lessons: [{
      title: String,
      description: String,
      duration: Number, // en minutes
      order: Number,
      videoUrl: String,
      documents: [{
        title: String,
        fileUrl: String,
        fileType: String
      }]
    }]
  },
  
  // Évaluations et barèmes
  evaluations: [{
    evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation' },
    title: String,
    weight: { type: Number, default: 1 }, // poids dans la note finale
    maxScore: Number
  }],
  
  // Fichiers et ressources
  files: [{
    filename: String,
    originalName: String,
    fileType: { 
      type: String, 
      enum: ['pdf', 'video', 'image', 'document', 'presentation'] 
    },
    fileUrl: String,
    cloudinaryId: String,
    uploadedAt: { type: Date, default: Date.now },
    description: String,
    isPublic: { type: Boolean, default: false }
  }],
  
  // Paramètres du cours
  settings: {
    isPublic: { type: Boolean, default: true },
    maxStudents: { type: Number, default: 50 },
    enrollmentType: { 
      type: String, 
      enum: ['gratuit', 'payant', 'sur-demande'],
      default: 'gratuit'
    },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' },
    language: { type: String, default: 'français' },
    certificate: { type: Boolean, default: false }
  },
  
  // Statistiques
  stats: {
    enrolledStudents: { type: Number, default: 0 },
    completedStudents: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 }
  },
  
  // Avis et commentaires
  reviews: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Statut et dates
  status: { 
    type: String, 
    enum: ['brouillon', 'actif', 'inactif', 'archive'],
    default: 'brouillon'
  },
  startDate: Date,
  endDate: Date,
  
  // Métadonnées
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index pour les recherches
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1 });
courseSchema.index({ subjects: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ featured: 1 });

// Méthodes d'instance
courseSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / this.reviews.length;
};

courseSchema.methods.getCompletionRate = function() {
  if (this.stats.enrolledStudents === 0) return 0;
  return (this.stats.completedStudents / this.stats.enrolledStudents) * 100;
};

courseSchema.methods.isEnrollmentOpen = function() {
  return this.status === 'actif' && 
         this.stats.enrolledStudents < this.settings.maxStudents &&
         (!this.endDate || this.endDate > new Date());
};

// Middleware pour mettre à jour les statistiques
courseSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.stats.averageRating = this.calculateAverageRating();
    this.stats.totalReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema); 