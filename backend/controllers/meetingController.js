const Session = require('../models/session');
const { v4: uuidv4 } = require('uuid');
const Meeting = require('../models/meeting');

// Create a session (teacher only)
exports.createSession = async (req, res) => {
  try {
    // Only teachers can create sessions
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers can create sessions.' });
    }
    const { title, description, date, startTime, duration } = req.body;
    // Generate a unique Jitsi room name
    const roomName = `edu4all-${uuidv4()}`;
    const link = `https://meet.jit.si/${roomName}`;
    const session = new Session({
      title,
      description,
      date,
      startTime,
      duration,
      link,
      teacherId: req.user._id,
      status: 'scheduled',
    });
    await session.save();
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// List all sessions (authenticated users)
exports.listSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('teacherId', 'name');
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Join a session (authenticated users)
exports.joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    // Add user to participants if not already present
    if (!session.students.includes(req.user._id)) {
      session.students.push(req.user._id);
    }
    // Track attendance
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    session.attendance.push({
      user: req.user._id,
      joinTime: new Date(),
      ip,
    });
    await session.save();
    res.json({ success: true, link: session.link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Edit a session (teacher only)
exports.editSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    // Only the teacher who created the session can edit
    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const { title, description, date, startTime, duration, status } = req.body;
    if (title !== undefined) session.title = title;
    if (description !== undefined) session.description = description;
    if (date !== undefined) session.date = date;
    if (startTime !== undefined) session.startTime = startTime;
    if (duration !== undefined) session.duration = duration;
    if (status !== undefined) session.status = status;
    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a session (teacher only)
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    // Only the teacher who created the session can delete
    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all meetings (for /api/meetings)
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
}; 