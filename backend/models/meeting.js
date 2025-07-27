const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  description: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema); 