const Session = require('../models/session');
const User = require('../models/user');
const Purchase = require('../models/purchase');
const Wallet = require('../models/wallet');
const { v4: uuidv4 } = require('uuid');

// Create a new video session (teacher only)
const createSession = async (req, res) => {
  try {
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({ 
        success: false, 
        message: 'Seuls les enseignants peuvent créer des sessions' 
      });
    }

    const {
      title,
      description,
      date,
      duration,
      maxParticipants,
      platform = 'jitsi',
      link,
      meetingId,
      password,
      isPaid = false,
      price = 0,
      currency = 'EUR',
      enrollmentDeadline,
      category,
      difficulty,
      tags,
      materials
    } = req.body;

    // Validate required fields
    if (!title || !date || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Titre, date et durée sont requis'
      });
    }

    // Check if date is in the future
    if (new Date(date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La date de session doit être dans le futur'
      });
    }

    // Create session
    const session = new Session({
      title,
      description,
      date: new Date(date),
      duration: parseInt(duration),
      maxParticipants: parseInt(maxParticipants) || 50,
      platform,
      link,
      meetingId,
      password,
      teacherId: req.user._id,
      isPaid,
      price: parseFloat(price),
      currency,
      enrollmentDeadline: enrollmentDeadline ? new Date(enrollmentDeadline) : null,
      category,
      difficulty,
      tags: tags || [],
      materials: materials || [],
      status: 'draft'
    });

    // Auto-generate Jitsi link if not provided
    if (platform === 'jitsi' && !link) {
      session.generateJitsiLink();
    }

    await session.save();

    // Populate teacher info
    await session.populate('teacherId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Session créée avec succès',
      data: { session }
    });

  } catch (error) {
    console.error('Erreur createSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session'
    });
  }
};

// Get all sessions for a user (teacher or student)
const getUserSessions = async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let sessions;
    
    if (type === 'upcoming') {
      sessions = await Session.findUpcomingSessions(userId, userRole);
    } else if (type === 'past') {
      sessions = await Session.findPastSessions(userId, userRole);
    } else {
      // Get all sessions
      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (userRole === 'enseignant') {
        query.teacherId = userId;
      } else {
        query.$or = [
          { students: userId },
          { enrolledStudents: userId }
        ];
      }
      
      sessions = await Session.find(query)
        .populate('teacherId', 'firstName lastName email')
        .populate('students', 'firstName lastName email')
        .sort({ date: -1 });
    }

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Erreur getUserSessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions'
    });
  }
};

// Get a specific session by ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacherId', 'firstName lastName email')
      .populate('students', 'firstName lastName email')
      .populate('enrolledStudents', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Check if user has access to this session
    const hasAccess = session.teacherId._id.toString() === req.user._id.toString() ||
                     session.students.includes(req.user._id) ||
                     session.enrolledStudents.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette session'
      });
    }

    res.json({
      success: true,
      data: { session }
    });

  } catch (error) {
    console.error('Erreur getSessionById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session'
    });
  }
};

// Update a session (teacher only)
const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Check if user is the teacher who created the session
    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'enseignant qui a créé la session peut la modifier'
      });
    }

    // Check if session can still be modified
    if (session.status === 'ongoing' || session.status === 'finished') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier une session en cours ou terminée'
      });
    }

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.teacherId;
    delete updateFields.status;
    delete updateFields.attendance;

    // Update session
    Object.assign(session, updateFields);
    
    // Re-generate Jitsi link if platform changed to jitsi
    if (updateFields.platform === 'jitsi' && !updateFields.link) {
      session.generateJitsiLink();
    }

    await session.save();
    
    // Populate teacher info
    await session.populate('teacherId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Session mise à jour avec succès',
      data: { session }
    });

  } catch (error) {
    console.error('Erreur updateSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la session'
    });
  }
};

// Publish a session (change status from draft to scheduled)
const publishSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (session.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Seules les sessions en brouillon peuvent être publiées'
      });
    }

    session.status = 'scheduled';
    await session.save();

    res.json({
      success: true,
      message: 'Session publiée avec succès',
      data: { session }
    });

  } catch (error) {
    console.error('Erreur publishSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication de la session'
    });
  }
};

// Enroll in a session (student only)
const enrollInSession = async (req, res) => {
  try {
    if (req.user.role !== 'etudiant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les étudiants peuvent s\'inscrire aux sessions'
      });
    }

    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de s\'inscrire à cette session'
      });
    }

    // Check if already enrolled
    if (session.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà inscrit à cette session'
      });
    }

    // Check if session is full
    if (session.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Cette session est complète'
      });
    }

    // Handle payment if session is paid
    if (session.isPaid) {
      const wallet = await Wallet.findOne({ user: req.user._id });
      
      if (!wallet || wallet.balance < session.price) {
        return res.status(400).json({
          success: false,
          message: 'Solde insuffisant pour s\'inscrire à cette session'
        });
      }

      // Deduct amount from wallet
      wallet.balance -= session.price;
      await wallet.save();

      // Create purchase record
      const purchase = new Purchase({
        user: req.user._id,
        course: session._id, // Using session as course for now
        type: 'full_course',
        amount: session.price,
        currency: session.currency,
        paymentMethod: 'wallet',
        status: 'completed',
        accessGranted: true,
        purchasedAt: new Date()
      });
      await purchase.save();
    }

    // Add student to enrolled list
    session.enrolledStudents.push(req.user._id);
    session.students.push(req.user._id);
    
    await session.save();

    res.json({
      success: true,
      message: 'Inscription réussie',
      data: { session }
    });

  } catch (error) {
    console.error('Erreur enrollInSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
};

// Join a session (for attendance tracking)
const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Check if user can join
    if (!session.canJoin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être inscrit pour rejoindre cette session'
      });
    }

    // Check if session is ongoing
    if (session.status !== 'ongoing' && session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cette session n\'est pas accessible actuellement'
      });
    }

    // Update session status to ongoing if it's time
    const now = new Date();
    const sessionStart = new Date(session.date);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60000));
    
    if (now >= sessionStart && now <= sessionEnd && session.status === 'scheduled') {
      session.status = 'ongoing';
    }

    // Track attendance
    const existingAttendance = session.attendance.find(
      a => a.user.toString() === req.user._id.toString()
    );

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.joinTime = new Date();
      existingAttendance.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      existingAttendance.deviceInfo = req.headers['user-agent'];
    } else {
      // Create new attendance record
      session.attendance.push({
        user: req.user._id,
        joinTime: new Date(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        deviceInfo: req.headers['user-agent']
      });
    }

    await session.save();

    res.json({
      success: true,
      message: 'Session rejointe avec succès',
      data: { 
        session,
        joinLink: session.link
      }
    });

  } catch (error) {
    console.error('Erreur joinSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion à la session'
    });
  }
};

// Leave a session (update attendance)
const leaveSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Find attendance record
    const attendance = session.attendance.find(
      a => a.user.toString() === req.user._id.toString()
    );

    if (attendance) {
      attendance.leaveTime = new Date();
      
      // Calculate duration
      if (attendance.joinTime) {
        const duration = Math.round((attendance.leaveTime - attendance.joinTime) / 60000);
        attendance.duration = duration;
      }
    }

    await session.save();

    res.json({
      success: true,
      message: 'Session quittée',
      data: { session }
    });

  } catch (error) {
    console.error('Erreur leaveSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
};

// Cancel a session (teacher only)
const cancelSession = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison de cancellation est requise'
      });
    }

    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'enseignant qui a créé la session peut l\'annuler'
      });
    }

    if (session.status === 'finished' || session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cette session ne peut plus être annulée'
      });
    }

    // Update session status
    session.status = 'cancelled';
    session.cancellationReason = reason;
    session.cancelledAt = new Date();
    session.cancelledBy = req.user._id;

    await session.save();

    // Process refunds for paid sessions
    if (session.isPaid && session.enrolledStudents.length > 0) {
      await processRefunds(session);
    }

    res.json({
      success: true,
      message: 'Session annulée avec succès',
      data: { session }
    });

  } catch (error) {
    console.error('Erreur cancelSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la session'
    });
  }
};

// Process refunds for cancelled sessions
const processRefunds = async (session) => {
  try {
    for (const studentId of session.enrolledStudents) {
      const purchase = await Purchase.findOne({
        user: studentId,
        course: session._id,
        status: 'completed'
      });

      if (purchase && purchase.paymentMethod === 'wallet') {
        // Refund to wallet
        const wallet = await Wallet.findOne({ user: studentId });
        if (wallet) {
          wallet.balance += session.price;
          await wallet.save();

          // Update purchase status
          purchase.status = 'refunded';
          purchase.refundedAt = new Date();
          await purchase.save();
        }
      }
    }

    session.refundProcessed = true;
    await session.save();

  } catch (error) {
    console.error('Erreur processRefunds:', error);
  }
};

// Delete a session (teacher only, only if no students enrolled)
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    if (session.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (session.enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une session avec des étudiants inscrits'
      });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Session supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur deleteSession:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la session'
    });
  }
};

// Get session statistics
const getSessionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    
    if (userRole === 'enseignant') {
      query.teacherId = userId;
    } else {
      query.$or = [
        { students: userId },
        { enrolledStudents: userId }
      ];
    }

    const stats = await Session.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    const totalSessions = await Session.countDocuments(query);
    const upcomingSessions = await Session.countDocuments({
      ...query,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'ongoing'] }
    });

    res.json({
      success: true,
      data: {
        stats,
        totalSessions,
        upcomingSessions
      }
    });

  } catch (error) {
    console.error('Erreur getSessionStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession,
  publishSession,
  enrollInSession,
  joinSession,
  leaveSession,
  cancelSession,
  deleteSession,
  getSessionStats
};
