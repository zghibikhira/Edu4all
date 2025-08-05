const Message = require('../models/message');

// Obtenir les messages récents pour le dashboard
const getRecentMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = 10;
    
    // Récupérer les messages récents de toutes les rooms où l'utilisateur est impliqué
    const recentMessages = await Message.find({
      $or: [
        { room: 'general' },
        { sender: userId },
        { receiver: userId }
      ],
      deleted: false
    })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
    // Compter les messages non lus
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      deleted: false
    });
    
    res.json({
      success: true,
      data: {
        messages: recentMessages,
        unreadCount: unreadCount
      }
    });
  } catch (error) {
    console.error('Erreur getRecentMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages récents'
    });
  }
};

// Obtenir l'historique des messages d'une room
const getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const messages = await Message.getRoomMessages(room, parseInt(limit), offset);
    
    res.json({
      success: true,
      data: {
        messages: messages,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur getRoomMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Obtenir les messages directs entre deux utilisateurs
const getDirectMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const messages = await Message.getDirectMessages(userId, receiverId, parseInt(limit), offset);
    
    res.json({
      success: true,
      data: {
        messages: messages,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur getDirectMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages directs'
    });
  }
};

// Obtenir les messages d'un cours
const getCourseMessages = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const messages = await Message.getCourseMessages(courseId, parseInt(limit), offset);
    
    res.json({
      success: true,
      data: {
        messages: messages,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur getCourseMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages du cours'
    });
  }
};

// Marquer des messages comme lus
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Liste de messages invalide'
      });
    }
    
    await Message.updateMany(
      { 
        _id: { $in: messageIds }, 
        receiver: userId,
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    console.error('Erreur markMessagesAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages'
    });
  }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer ce message'
      });
    }
    
    await message.deleteMessage();
    
    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message'
    });
  }
};

// Modifier un message
const editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contenu du message requis'
      });
    }
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas modifier ce message'
      });
    }
    
    if (message.edited) {
      return res.status(400).json({
        success: false,
        message: 'Ce message a déjà été modifié'
      });
    }
    
    await message.editMessage(content.trim());
    
    res.json({
      success: true,
      message: 'Message modifié avec succès',
      data: {
        message: message
      }
    });
  } catch (error) {
    console.error('Erreur editMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du message'
    });
  }
};

module.exports = {
  getRecentMessages,
  getRoomMessages,
  getDirectMessages,
  getCourseMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage
}; 