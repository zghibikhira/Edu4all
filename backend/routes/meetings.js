const express = require('express');
const router = express.Router();
const { getAllMeetings } = require('../controllers/meetingController');
const Meeting = require('../models/meeting');

// GET /api/meetings
router.get('/', getAllMeetings);

// POST /api/meetings
router.post('/', async (req, res) => {
  const { date, teacherId, title } = req.body;
  try {
    const meeting = new Meeting({
      date,
      teacher: teacherId,
      title: title || 'Available Slot',
      status: 'available'
    });
    await meeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create meeting slot' });
  }
});

// GET /api/meetings/student/:id - Get meetings for a specific student
router.get('/student/:id', async (req, res) => {
  try {
    const meetings = await Meeting.find({ 
      student: req.params.id,
      status: 'booked'
    }).populate('teacher', 'firstName lastName email profileImage subject');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student meetings' });
  }
});

// POST /api/meetings/:id/book
router.post('/:id/book', async (req, res) => {
  const meetingId = req.params.id;
  const { studentId } = req.body;
  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    if (meeting.status !== 'available') {
      return res.status(400).json({ error: 'Meeting is not available' });
    }
    meeting.status = 'booked';
    meeting.student = studentId;
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book meeting' });
  }
});

module.exports = router; 