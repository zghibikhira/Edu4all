const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Dashboard stats endpoint
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Mock data for now - replace with actual database queries
    const stats = {
      evaluations: 8,
      courses: 12,
      meetings: 3,
      progress: 78
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des statistiques'
    });
  }
});

// Dashboard activity endpoint
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    // Mock data for recent activity
    const activity = [
      { type: 'evaluation', title: 'Math Quiz Completed', date: '2025-08-23', status: 'completed' },
      { type: 'course', title: 'Advanced JavaScript', date: '2025-08-22', status: 'in-progress' },
      { type: 'meeting', title: 'Tutoring Session', date: '2025-08-21', status: 'scheduled' },
      { type: 'course', title: 'React Fundamentals', date: '2025-08-20', status: 'completed' }
    ];

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de l\'activité'
    });
  }
});

// Student-specific dashboard endpoints
router.get('/student/courses', authenticateToken, async (req, res) => {
  try {
    // Mock data for student courses
    const courses = [
      { id: 1, title: 'Advanced JavaScript', progress: 75, status: 'in-progress' },
      { id: 2, title: 'React Fundamentals', progress: 100, status: 'completed' },
      { id: 3, title: 'Node.js Backend', progress: 25, status: 'in-progress' }
    ];

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des cours'
    });
  }
});

router.get('/student/evaluations', authenticateToken, async (req, res) => {
  try {
    // Mock data for student evaluations
    const evaluations = [
      { id: 1, title: 'Math Quiz', status: 'completed', score: 85 },
      { id: 2, title: 'JavaScript Test', status: 'pending', score: null },
      { id: 3, title: 'React Assignment', status: 'completed', score: 92 }
    ];

    res.json({
      success: true,
      data: evaluations
    });
  } catch (error) {
    console.error('Error fetching student evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des évaluations'
    });
  }
});

router.get('/student/meetings', authenticateToken, async (req, res) => {
  try {
    // Mock data for student meetings
    const meetings = [
      { id: 1, title: 'Tutoring Session', date: '2025-08-25', status: 'scheduled' },
      { id: 2, title: 'Code Review', date: '2025-08-28', status: 'scheduled' }
    ];

    res.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Error fetching student meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des meetings'
    });
  }
});

router.get('/student/progress', authenticateToken, async (req, res) => {
  try {
    // Mock data for student progress
    const progress = {
      overall: 78,
      courses: [
        { name: 'JavaScript', progress: 85 },
        { name: 'React', progress: 70 },
        { name: 'Node.js', progress: 45 }
      ]
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la progression'
    });
  }
});

router.get('/student/wallet', authenticateToken, async (req, res) => {
  try {
    // Mock data for student wallet
    const wallet = {
      balance: 25.50,
      transactions: [
        { id: 1, amount: 10.00, type: 'credit', description: 'Recharge', date: '2025-08-20' },
        { id: 2, amount: -5.00, type: 'debit', description: 'Course purchase', date: '2025-08-19' }
      ]
    };

    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Error fetching student wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement du wallet'
    });
  }
});

module.exports = router;
