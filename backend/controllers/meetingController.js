const Meeting = require('../models/meeting');
const User = require('../models/user');

// GET /api/meetings
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('teacher', 'firstName lastName email')
      .populate('student', 'firstName lastName email');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 