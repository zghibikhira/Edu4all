const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getRecentMessages,
  getRoomMessages,
  getDirectMessages,
  getCourseMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage
} = require('../controllers/messageController');

// Routes protégées (authentification requise)
router.use(authenticateToken);

// Obtenir les messages récents pour le dashboard
router.get('/recent', getRecentMessages);

// Obtenir les messages d'une room
router.get('/room/:room', getRoomMessages);

// Obtenir les messages directs
router.get('/direct/:receiverId', getDirectMessages);

// Obtenir les messages d'un cours
router.get('/course/:courseId', getCourseMessages);

// Marquer des messages comme lus
router.post('/mark-read', markMessagesAsRead);

// Supprimer un message
router.delete('/:messageId', deleteMessage);

// Modifier un message
router.put('/:messageId', editMessage);

module.exports = router; 