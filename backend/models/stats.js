const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  // Statistiques globales
  totalUsers: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalTeachers: {
    type: Number,
    default: 0
  },
  totalCourses: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  // Statistiques par jour
  dailyStats: [{
    date: {
      type: Date,
      required: true
    },
    newUsers: {
      type: Number,
      default: 0
    },
    newCourses: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  }],
  
  // Statistiques par mois
  monthlyStats: [{
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    newUsers: {
      type: Number,
      default: 0
    },
    newCourses: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  }],
  
  // Métadonnées
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
statsSchema.index({ 'dailyStats.date': 1 });
statsSchema.index({ 'monthlyStats.month': 1, 'monthlyStats.year': 1 });

// Méthodes statiques
statsSchema.statics.getGlobalStats = function() {
  return this.findOne().sort({ createdAt: -1 }).limit(1);
};

statsSchema.statics.updateDailyStats = function(date, updates) {
  return this.findOneAndUpdate(
    { 'dailyStats.date': date },
    { $set: { 'dailyStats.$.newUsers': updates.newUsers || 0 } },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Stats', statsSchema); 