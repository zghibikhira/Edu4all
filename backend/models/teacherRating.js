const mongoose = require('mongoose');

const teacherRatingSchema = new mongoose.Schema({
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
    ref: 'Course',
    required: false
  },
  
  // Évaluation globale de l'enseignant
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Critères détaillés
  criteria: {
    teachingQuality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    availability: { type: Number, min: 1, max: 5 },
    organization: { type: Number, min: 1, max: 5 },
    feedback: { type: Number, min: 1, max: 5 }
  },
  
  // Commentaire détaillé
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Recommandation
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  
  // Statut de modération
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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
teacherRatingSchema.index({ teacher: 1, status: 1 });
teacherRatingSchema.index({ student: 1 });
teacherRatingSchema.index({ course: 1 });
teacherRatingSchema.index({ overallRating: 1 });
teacherRatingSchema.index({ createdAt: -1 });

// Méthodes d'instance
teacherRatingSchema.methods.calculateAverageCriteria = function() {
  const criteriaValues = Object.values(this.criteria);
  const sum = criteriaValues.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / criteriaValues.length) * 10) / 10;
};

// Méthodes statiques
teacherRatingSchema.statics.getTeacherStats = async function(teacherId) {
  const stats = await this.aggregate([
    { $match: { teacher: mongoose.Types.ObjectId(teacherId), status: 'approved' } },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating' },
        averageTeachingQuality: { $avg: '$criteria.teachingQuality' },
        averageCommunication: { $avg: '$criteria.communication' },
        averageAvailability: { $avg: '$criteria.availability' },
        averageOrganization: { $avg: '$criteria.organization' },
        averageFeedback: { $avg: '$criteria.feedback' },
        recommendationRate: {
          $avg: { $cond: ['$wouldRecommend', 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRatings: 0,
    averageRating: 0,
    averageTeachingQuality: 0,
    averageCommunication: 0,
    averageAvailability: 0,
    averageOrganization: 0,
    averageFeedback: 0,
    recommendationRate: 0
  };
};

teacherRatingSchema.statics.getTopTeachers = async function(limit = 10) {
  return await this.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: '$teacher',
        averageRating: { $avg: '$overallRating' },
        totalRatings: { $sum: 1 }
      }
    },
    { $match: { totalRatings: { $gte: 3 } } }, // Au moins 3 évaluations
    { $sort: { averageRating: -1, totalRatings: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('TeacherRating', teacherRatingSchema);
