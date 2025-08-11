const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinTime: Date,
  leaveTime: Date,
  ip: String,
  duration: Number, // in minutes
  deviceInfo: String
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true }, // session date and time
  startTime: String, // e.g. '14:00'
  duration: { type: Number, required: true, default: 60 }, // in minutes
  maxParticipants: { type: Number, default: 50 },
  
  // Video conference details
  platform: { 
    type: String, 
    enum: ['jitsi', 'zoom', 'teams', 'custom'], 
    default: 'jitsi' 
  },
  link: String, // Jitsi/Zoom link
  meetingId: String, // Zoom meeting ID
  password: String, // Meeting password if required
  
  // Session management
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Students who paid/enrolled
  
  // Status and lifecycle
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'ongoing', 'finished', 'cancelled'], 
    default: 'draft' 
  },
  
  // Payment and enrollment
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  enrollmentDeadline: Date, // Last date to enroll
  
  // Attendance tracking
  attendance: [attendanceSchema],
  
  // Session materials
  materials: [{
    title: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'other'] },
    url: String,
    description: String
  }],
  
  // Notifications
  notifications: [{
    type: { type: String, enum: ['reminder', 'cancellation', 'update'] },
    sentAt: Date,
    recipients: [String] // email addresses
  }],
  
  // Cancellation and refund
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refundProcessed: { type: Boolean, default: false },
  
  // Recording
  recordingUrl: String,
  recordingAvailable: { type: Boolean, default: false },
  
  // Metadata
  tags: [String],
  category: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
}, {
  timestamps: true
});

// Indexes for performance
sessionSchema.index({ teacherId: 1, date: -1 });
sessionSchema.index({ status: 1, date: 1 });
sessionSchema.index({ students: 1, date: -1 });
sessionSchema.index({ 'enrolledStudents': 1, date: -1 });

// Virtual for end time
sessionSchema.virtual('endTime').get(function() {
  if (!this.date || !this.duration) return null;
  const endTime = new Date(this.date);
  endTime.setMinutes(endTime.getMinutes() + this.duration);
  return endTime;
});

// Virtual for session status based on time
sessionSchema.virtual('timeStatus').get(function() {
  if (!this.date) return 'unknown';
  
  const now = new Date();
  const sessionStart = new Date(this.date);
  const sessionEnd = new Date(sessionStart.getTime() + (this.duration * 60000));
  
  if (now < sessionStart) return 'upcoming';
  if (now >= sessionStart && now <= sessionEnd) return 'ongoing';
  if (now > sessionEnd) return 'finished';
  
  return 'unknown';
});

// Instance methods
sessionSchema.methods.canJoin = function(userId) {
  // Check if user is enrolled or if session is free
  if (!this.isPaid) return true;
  return this.enrolledStudents.includes(userId);
};

sessionSchema.methods.isFull = function() {
  return this.students.length >= this.maxParticipants;
};

sessionSchema.methods.canCancel = function(userId) {
  // Teachers can always cancel, students can cancel if within deadline
  if (this.teacherId.toString() === userId.toString()) return true;
  
  if (this.enrollmentDeadline && new Date() < this.enrollmentDeadline) {
    return this.enrolledStudents.includes(userId);
  }
  
  return false;
};

sessionSchema.methods.generateJitsiLink = function() {
  if (this.platform === 'jitsi') {
    const roomName = `edu4all-${this._id}-${Date.now()}`;
    this.link = `https://meet.jit.si/${roomName}`;
    this.meetingId = roomName;
  }
  return this.link;
};

// Static methods
sessionSchema.statics.findUpcomingSessions = function(userId, role) {
  const query = { 
    date: { $gte: new Date() },
    status: { $in: ['scheduled', 'ongoing'] }
  };
  
  if (role === 'teacher') {
    query.teacherId = userId;
  } else {
    query.$or = [
      { students: userId },
      { enrolledStudents: userId }
    ];
  }
  
  return this.find(query)
    .populate('teacherId', 'firstName lastName email')
    .populate('students', 'firstName lastName email')
    .sort({ date: 1 });
};

sessionSchema.statics.findPastSessions = function(userId, role) {
  const query = { 
    date: { $lt: new Date() },
    status: { $in: ['finished', 'cancelled'] }
  };
  
  if (role === 'teacher') {
    query.teacherId = userId;
  } else {
    query.$or = [
      { students: userId },
      { enrolledStudents: userId }
    ];
  }
  
  return this.find(query)
    .populate('teacherId', 'firstName lastName email')
    .populate('students', 'firstName lastName email')
    .sort({ date: -1 });
};

// Pre-save middleware
sessionSchema.pre('save', function(next) {
  // Auto-generate Jitsi link if not provided
  if (this.platform === 'jitsi' && !this.link) {
    this.generateJitsiLink();
  }
  
  // Set default enrollment deadline if not set
  if (this.isPaid && !this.enrollmentDeadline) {
    const deadline = new Date(this.date);
    deadline.setHours(deadline.getHours() - 24); // 24 hours before session
    this.enrollmentDeadline = deadline;
  }
  
  next();
});

module.exports = mongoose.model('Session', sessionSchema);
