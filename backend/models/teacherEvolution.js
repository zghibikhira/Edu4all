const mongoose = require('mongoose');

const teacherEvolutionSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  
  periodStart: {
    type: Date,
    required: true
  },
  
  periodEnd: {
    type: Date,
    required: true
  },
  
  metrics: {
    // Rating improvements
    ratingImprovement: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    
    // Student growth
    studentGrowth: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    newStudents: {
      type: Number,
      default: 0
    },
    
    // Revenue metrics
    revenueGrowth: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRevenuePerSession: {
      type: Number,
      default: 0
    },
    
    // Session metrics
    sessionCompletion: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    cancelledSessions: {
      type: Number,
      default: 0
    },
    cancellationRate: {
      type: Number,
      default: 0
    },
    
    // Skill development
    skillDevelopment: [{
      skill: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      improvement: Number
    }],
    
    // Engagement metrics
    engagementRate: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 0
    },
    studentRetention: {
      type: Number,
      default: 0
    }
  },
  
  evolutionScore: {
    type: Number,
    default: 0
  },
  
  rank: {
    type: String,
    enum: ['Novice', 'Apprentice', 'Professional', 'Expert', 'Master'],
    default: 'Novice'
  },
  
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['rating', 'revenue', 'students', 'sessions', 'skills']
    }
  }],
  
  goals: [{
    title: String,
    description: String,
    target: Number,
    current: Number,
    deadline: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending'
    }
  }],
  
  recommendations: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['teaching', 'marketing', 'skills', 'engagement', 'revenue']
    }
  }],
  
  trends: {
    ratingTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    revenueTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    },
    studentTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable'
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
teacherEvolutionSchema.index({ teacherId: 1, period: 1, periodStart: -1 });
teacherEvolutionSchema.index({ evolutionScore: -1, periodStart: -1 });
teacherEvolutionSchema.index({ rank: 1, evolutionScore: -1 });

// Methods
teacherEvolutionSchema.methods.calculateEvolutionScore = function() {
  const weights = {
    ratingImprovement: 0.25,
    studentGrowth: 0.20,
    revenueGrowth: 0.20,
    sessionCompletion: 0.15,
    engagementRate: 0.10,
    skillDevelopment: 0.10
  };
  
  let score = 0;
  
  // Rating improvement (0-100)
  score += (this.metrics.ratingImprovement || 0) * weights.ratingImprovement;
  
  // Student growth (0-100)
  score += Math.min((this.metrics.studentGrowth || 0) * 10, 100) * weights.studentGrowth;
  
  // Revenue growth (0-100)
  score += Math.min((this.metrics.revenueGrowth || 0) * 5, 100) * weights.revenueGrowth;
  
  // Session completion (0-100)
  score += (this.metrics.sessionCompletion || 0) * weights.sessionCompletion;
  
  // Engagement rate (0-100)
  score += (this.metrics.engagementRate || 0) * weights.engagementRate;
  
  // Skill development (0-100)
  const skillScore = this.metrics.skillDevelopment.length * 10;
  score += Math.min(skillScore, 100) * weights.skillDevelopment;
  
  this.evolutionScore = Math.round(score * 100) / 100;
  return this.evolutionScore;
};

teacherEvolutionSchema.methods.updateRank = function() {
  const score = this.evolutionScore;
  
  if (score >= 90) {
    this.rank = 'Master';
  } else if (score >= 75) {
    this.rank = 'Expert';
  } else if (score >= 60) {
    this.rank = 'Professional';
  } else if (score >= 40) {
    this.rank = 'Apprentice';
  } else {
    this.rank = 'Novice';
  }
  
  return this.rank;
};

teacherEvolutionSchema.methods.addAchievement = function(achievement) {
  this.achievements.push(achievement);
  return this.save();
};

teacherEvolutionSchema.methods.addGoal = function(goal) {
  this.goals.push(goal);
  return this.save();
};

teacherEvolutionSchema.methods.addRecommendation = function(recommendation) {
  this.recommendations.push(recommendation);
  return this.save();
};

// Static methods
teacherEvolutionSchema.statics.getTeacherEvolution = async function(teacherId, period = 'monthly', limit = 12) {
  return this.find({ teacherId, period })
    .sort({ periodStart: -1 })
    .limit(limit)
    .populate('teacherId', 'firstName lastName email avatar');
};

teacherEvolutionSchema.statics.getEvolutionLeaderboard = async function(period = 'monthly', limit = 50) {
  const currentPeriod = await this.getCurrentPeriod(period);
  
  return this.find({
    period,
    periodStart: currentPeriod.start,
    periodEnd: currentPeriod.end
  })
    .sort({ evolutionScore: -1 })
    .limit(limit)
    .populate('teacherId', 'firstName lastName email avatar teacherInfo.rank');
};

teacherEvolutionSchema.statics.getCurrentPeriod = function(period) {
  const now = new Date();
  let start, end;
  
  switch (period) {
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      break;
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  
  return { start, end };
};

teacherEvolutionSchema.statics.getEvolutionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTeachers: { $addToSet: '$teacherId' },
        averageEvolutionScore: { $avg: '$evolutionScore' },
        totalAchievements: { $sum: { $size: '$achievements' } },
        totalGoals: { $sum: { $size: '$goals' } }
      }
    }
  ]);
  
  return stats[0] || {
    totalTeachers: [],
    averageEvolutionScore: 0,
    totalAchievements: 0,
    totalGoals: 0
  };
};

// Pre-save middleware
teacherEvolutionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate evolution score and rank
  this.calculateEvolutionScore();
  this.updateRank();
  
  next();
});

module.exports = mongoose.model('TeacherEvolution', teacherEvolutionSchema);
