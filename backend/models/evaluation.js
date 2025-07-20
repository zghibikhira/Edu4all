const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Relations
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // À créer plus tard
    required: false
  },
  
  // Type d'évaluation
  type: {
    type: String,
    enum: ['devoir', 'examen', 'projet', 'participation', 'autre'],
    default: 'devoir'
  },
  
  // Barème et notes
  maxScore: {
    type: Number,
    required: true,
    min: 0
  },
  score: {
    type: Number,
    min: 0,
    default: null
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    default: null
  },
  
  // Critères d'évaluation
  criteria: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    maxPoints: {
      type: Number,
      required: true,
      min: 0
    },
    points: {
      type: Number,
      min: 0,
      default: 0
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  }],
  
  // Commentaires
  teacherComments: {
    type: String,
    trim: true
  },
  studentComments: {
    type: String,
    trim: true
  },
  
  // Questions pour évaluation en ligne
  questions: [{
    question: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['qcm', 'vrai_faux', 'texte_libre', 'numerique'],
      default: 'qcm'
    },
    options: [{ type: String }], // Pour QCM
    correctAnswer: { type: String }, // Pour QCM et vrai/faux
    correctAnswers: [{ type: String }], // Pour QCM multiple
    points: { type: Number, default: 1 },
    order: { type: Number }
  }],
  
  // Réponses de l'étudiant (pour évaluation en ligne)
  studentAnswers: [{
    questionIndex: { type: Number },
    answer: { type: String },
    answers: [{ type: String }], // Pour réponses multiples
    isCorrect: { type: Boolean },
    points: { type: Number, default: 0 }
  }],
  
  // Fichiers soumis
  submittedFiles: [{
    filename: String,
    originalName: String,
    url: String,
    fileType: String,
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Fichiers corrigés
  correctedFiles: [{
    filename: String,
    originalName: String,
    url: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['en_attente', 'soumis', 'en_correction', 'corrigé', 'publié'],
    default: 'en_attente'
  },
  
  // Paramètres pour évaluation en ligne
  duration: { type: Number }, // Durée en minutes
  isPublic: { type: Boolean, default: false },
  allowRetake: { type: Boolean, default: false },
  maxAttempts: { type: Number, default: 1 },
  currentAttempt: { type: Number, default: 0 },
  startTime: { type: Date },
  endTime: { type: Date },
  
  // Dates
  dueDate: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date
  },
  gradedAt: {
    type: Date
  },
  
  // Métadonnées
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
evaluationSchema.index({ student: 1, status: 1 });
evaluationSchema.index({ teacher: 1, status: 1 });
evaluationSchema.index({ course: 1 });
evaluationSchema.index({ dueDate: 1 });

// Méthodes virtuelles
evaluationSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status === 'en_attente';
});

evaluationSchema.virtual('isSubmitted').get(function() {
  return this.status === 'soumis' || this.status === 'en_correction' || this.status === 'corrigé' || this.status === 'publié';
});

evaluationSchema.virtual('isGraded').get(function() {
  return this.status === 'corrigé' || this.status === 'publié';
});

// Méthodes d'instance
evaluationSchema.methods.calculatePercentage = function() {
  if (this.score !== null && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 100);
  }
  return this.percentage;
};

evaluationSchema.methods.calculateGrade = function() {
  if (this.percentage === null) return null;
  
  if (this.percentage >= 95) return 'A+';
  if (this.percentage >= 90) return 'A';
  if (this.percentage >= 85) return 'A-';
  if (this.percentage >= 80) return 'B+';
  if (this.percentage >= 75) return 'B';
  if (this.percentage >= 70) return 'B-';
  if (this.percentage >= 65) return 'C+';
  if (this.percentage >= 60) return 'C';
  if (this.percentage >= 55) return 'C-';
  if (this.percentage >= 50) return 'D+';
  if (this.percentage >= 45) return 'D';
  return 'F';
};

// Middleware pre-save
evaluationSchema.pre('save', function(next) {
  if (this.score !== null) {
    this.calculatePercentage();
    this.grade = this.calculateGrade();
  }
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema); 