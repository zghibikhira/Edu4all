const mongoose = require('mongoose');
const User = require('./user');

// Schéma spécifique aux étudiants
const studentSchema = new mongoose.Schema({
  // Informations académiques
  level: { 
    type: String, 
    enum: ['primaire', 'college', 'lycee', 'superieur'],
    required: true
  },
  grade: { 
    type: String 
  },
  school: { 
    type: String 
  },
  
  // Langues parlées
  languages: [{ 
    type: String 
  }],
  
  // Accessibilité
  accessibility: {
    hasDisability: { type: Boolean, default: false },
    needs: [{ type: String }]
  },
  
  // Préférences d'apprentissage
  learningPreferences: {
    preferredSubjects: [{ type: String }],
    preferredTeachingStyle: { 
      type: String, 
      enum: ['visuel', 'auditif', 'kinesthesique', 'mixte'],
      default: 'mixte'
    },
    groupSize: { 
      type: String, 
      enum: ['individuel', 'petit-groupe', 'grand-groupe'],
      default: 'petit-groupe'
    }
  },
  
  // Progression et objectifs
  goals: [{
    subject: String,
    target: String,
    deadline: Date,
    completed: { type: Boolean, default: false }
  }],
  
  // Historique des cours
  courseHistory: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: Date,
    endDate: Date,
    status: { 
      type: String, 
      enum: ['en-cours', 'termine', 'abandonne'],
      default: 'en-cours'
    },
    grade: Number,
    feedback: String
  }],
  
  // Évaluations
  evaluations: [{
    evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation' },
    score: Number,
    maxScore: Number,
    completedAt: Date,
    feedback: String
  }],
  
  // Fichiers uploadés
  uploadedFiles: [{
    filename: String,
    originalName: String,
    fileType: { 
      type: String, 
      enum: ['pdf', 'video', 'image', 'document'] 
    },
    fileUrl: String,
    cloudinaryId: String,
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }]
}, {
  timestamps: true
});

// Méthodes d'instance
studentSchema.methods.getAverageGrade = function() {
  if (this.evaluations.length === 0) return 0;
  const total = this.evaluations.reduce((sum, eval) => sum + (eval.score || 0), 0);
  return total / this.evaluations.length;
};

studentSchema.methods.getCompletedCourses = function() {
  return this.courseHistory.filter(course => course.status === 'termine');
};

studentSchema.methods.getActiveCourses = function() {
  return this.courseHistory.filter(course => course.status === 'en-cours');
};

module.exports = mongoose.model('Student', studentSchema); 