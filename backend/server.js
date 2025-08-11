const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const http = require('http'); // Add this line
const { Server } = require('socket.io'); // Add this line
const jwt = require('jsonwebtoken'); // Add this line
const Message = require('./models/message'); // Add this line

const app = express();
const server = http.createServer(app); // Use http.Server for Socket.IO
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);//sprint6:etape 1

// Middleware de sécurité
app.use(helmet());

// Middleware de logging
app.use(morgan('combined'));

// Middleware CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004'
  ],
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const evaluationRoutes = require('./routes/evaluations');
const courseRoutes = require('./routes/courses');
const meetingRoutes = require('./routes/meetings');
const walletRoutes = require('./routes/wallet');
const paymentRoutes = require('./routes/payments');
const purchaseRoutes = require('./routes/purchases');
const messageRoutes = require('./routes/messages');
const teacherRatingRoutes = require('./routes/teacherRatings');
const commentRoutes = require('./routes/comments');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/teacher-ratings', teacherRatingRoutes);
app.use('/api/comments', commentRoutes);

// Serve uploaded videos statically
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

    // Route de santé
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Edu4All API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Test Socket.IO connection
    app.get('/api/socket-test', (req, res) => {
      res.json({
        success: true,
        message: 'Socket.IO server is running',
        socketConnections: io.engine.clientsCount
      });
    });

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Edu4All',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Middleware de gestion d'erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Configuration MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edu4all', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Démarrage du serveur
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // --- SOCKET.IO SETUP ---
    const io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002'
        ],
        credentials: true
      }
    });

    // Store connected users
    const connectedUsers = new Map();
    const typingUsers = new Map();

    // JWT authentication middleware for Socket.IO
    io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token;
      console.log('Socket auth - Token received:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('Socket auth - No token provided');
        return next(new Error('Authentication error: No token'));
      }
      
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
        console.log('Socket auth - User decoded:', user);
        socket.user = user;
        next();
      } catch (err) {
        console.error('Socket auth - JWT verification failed:', err.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', async (socket) => {
      const userId = socket.user.id;
      const userName = socket.user.name || socket.user.email;
      
      console.log('User connected:', userName, 'ID:', userId);
      
      // Add user to connected users
      connectedUsers.set(userId, {
        socketId: socket.id,
        name: userName,
        role: socket.user.role,
        connectedAt: new Date()
      });

      // Join general room
      socket.join('general');
      
      // Emit user list to all clients
      io.emit('userList', Array.from(connectedUsers.values()));

      // Send last 50 messages as history for general room
      try {
        const history = await Message.getRoomMessages('general', 50);
        socket.emit('messageHistory', history.reverse());
      } catch (err) {
        console.error('Failed to load message history:', err);
      }

      // Handle joining specific rooms (courses, direct messages)
      socket.on('joinRoom', async (roomData) => {
        const { room, courseId } = roomData;
        
        if (room) {
          socket.join(room);
          console.log(`${userName} joined room: ${room}`);
          
          // Send room-specific message history
          try {
            const history = await Message.getRoomMessages(room, 50);
            socket.emit('messageHistory', history.reverse());
          } catch (err) {
            console.error('Failed to load room history:', err);
          }
        }
        
        if (courseId) {
          const courseRoom = `course_${courseId}`;
          socket.join(courseRoom);
          console.log(`${userName} joined course room: ${courseRoom}`);
          
          // Send course-specific message history
          try {
            const history = await Message.getCourseMessages(courseId, 50);
            socket.emit('messageHistory', history.reverse());
          } catch (err) {
            console.error('Failed to load course history:', err);
          }
        }
      });

      // Handle direct messages
      socket.on('joinDirectMessage', async (receiverId) => {
        const directRoom = `dm_${[userId, receiverId].sort().join('_')}`;
        socket.join(directRoom);
        
        // Send direct message history
        try {
          const history = await Message.getDirectMessages(userId, receiverId, 50);
          socket.emit('messageHistory', history.reverse());
        } catch (err) {
          console.error('Failed to load DM history:', err);
        }
      });

      // Real-time chat messages
      socket.on('sendMessage', async (messageData) => {
        const { content, room = 'general', receiverId, courseId, messageType = 'text' } = messageData;
        
        if (!content || content.trim().length === 0) return;
        
        try {
          // Create message in database
          const message = new Message({
            sender: userId,
            receiver: receiverId,
            courseId: courseId,
            room: room,
            content: content.trim(),
            messageType: messageType
          });
          
          // Temporarily disable database saving for testing
          // await message.save();
          
          // Create a mock message object for testing
          const mockMessage = {
            _id: Date.now().toString(),
            sender: { _id: userId, name: userName, email: socket.user.email, role: socket.user.role },
            receiver: receiverId,
            courseId: courseId,
            room: room,
            content: content.trim(),
            messageType: messageType,
            createdAt: new Date(),
            edited: false
          };
          
          // Populate sender info for mock message
          // await message.populate('sender', 'name email role');
          
          // Determine target room
          let targetRoom = room;
          if (receiverId) {
            targetRoom = `dm_${[userId, receiverId].sort().join('_')}`;
          } else if (courseId) {
            targetRoom = `course_${courseId}`;
          }
          
          // Broadcast message to room
          io.to(targetRoom).emit('newMessage', {
            _id: mockMessage._id,
            sender: mockMessage.sender,
            receiver: mockMessage.receiver,
            courseId: mockMessage.courseId,
            room: mockMessage.room,
            content: mockMessage.content,
            messageType: mockMessage.messageType,
            createdAt: mockMessage.createdAt,
            edited: mockMessage.edited
          });
          
          // Stop typing indicator
          typingUsers.delete(userId);
          io.to(targetRoom).emit('userStoppedTyping', { userId, userName });
          
        } catch (err) {
          console.error('Failed to save message:', err);
          socket.emit('messageError', { error: 'Failed to send message' });
        }
      });

      // Typing indicators
      socket.on('typing', (data) => {
        const { room = 'general', receiverId, courseId } = data;
        
        typingUsers.set(userId, {
          userName,
          room: room,
          receiverId,
          courseId,
          timestamp: Date.now()
        });
        
        let targetRoom = room;
        if (receiverId) {
          targetRoom = `dm_${[userId, receiverId].sort().join('_')}`;
        } else if (courseId) {
          targetRoom = `course_${courseId}`;
        }
        
        socket.to(targetRoom).emit('userTyping', { userId, userName });
      });

      socket.on('stopTyping', (data) => {
        const { room = 'general', receiverId, courseId } = data;
        
        typingUsers.delete(userId);
        
        let targetRoom = room;
        if (receiverId) {
          targetRoom = `dm_${[userId, receiverId].sort().join('_')}`;
        } else if (courseId) {
          targetRoom = `course_${courseId}`;
        }
        
        socket.to(targetRoom).emit('userStoppedTyping', { userId, userName });
      });

      // Message actions
      socket.on('editMessage', async (data) => {
        const { messageId, newContent, room = 'general', receiverId, courseId } = data;
        
        try {
          const message = await Message.findById(messageId);
          
          if (!message || message.sender.toString() !== userId) {
            socket.emit('messageError', { error: 'Cannot edit this message' });
            return;
          }
          
          await message.editMessage(newContent);
          await message.populate('sender', 'name email role');
          
          let targetRoom = room;
          if (receiverId) {
            targetRoom = `dm_${[userId, receiverId].sort().join('_')}`;
          } else if (courseId) {
            targetRoom = `course_${courseId}`;
          }
          
          io.to(targetRoom).emit('messageEdited', {
            messageId: message._id,
            content: message.content,
            edited: message.edited,
            editedAt: message.editedAt
          });
          
        } catch (err) {
          console.error('Failed to edit message:', err);
          socket.emit('messageError', { error: 'Failed to edit message' });
        }
      });

      socket.on('deleteMessage', async (data) => {
        const { messageId, room = 'general', receiverId, courseId } = data;
        
        try {
          const message = await Message.findById(messageId);
          
          if (!message || message.sender.toString() !== userId) {
            socket.emit('messageError', { error: 'Cannot delete this message' });
            return;
          }
          
          await message.deleteMessage();
          
          let targetRoom = room;
          if (receiverId) {
            targetRoom = `dm_${[userId, receiverId].sort().join('_')}`;
          } else if (courseId) {
            targetRoom = `course_${courseId}`;
          }
          
          io.to(targetRoom).emit('messageDeleted', { messageId: message._id });
          
        } catch (err) {
          console.error('Failed to delete message:', err);
          socket.emit('messageError', { error: 'Failed to delete message' });
        }
      });

      // Mark messages as read
      socket.on('markAsRead', async (data) => {
        const { messageIds, room = 'general', receiverId, courseId } = data;
        
        try {
          await Message.updateMany(
            { _id: { $in: messageIds }, receiver: userId },
            { isRead: true, readAt: new Date() }
          );
          
          let targetRoom = room;
          if (receiverId) {
            targetRoom = `dm_${[userId, receiverId].sort().join('_')}`;
          } else if (courseId) {
            targetRoom = `course_${courseId}`;
          }
          
          socket.to(targetRoom).emit('messagesRead', { messageIds });
          
        } catch (err) {
          console.error('Failed to mark messages as read:', err);
        }
      });

      // Notifications
      socket.on('sendNotification', (notif) => {
        io.emit('notification', {
          ...notif,
          sender: userName,
          timestamp: new Date()
        });
      });

      // Live session presence management
      socket.on('joinSession', (sessionId) => {
        socket.join(sessionId);
        io.to(sessionId).emit('userJoined', { 
          userId, 
          userName,
          timestamp: new Date()
        });
      });

      socket.on('leaveSession', (sessionId) => {
        socket.leave(sessionId);
        io.to(sessionId).emit('userLeft', { 
          userId, 
          userName,
          timestamp: new Date()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', userName, 'ID:', userId);
        
        // Remove from connected users
        connectedUsers.delete(userId);
        typingUsers.delete(userId);
        
        // Emit updated user list
        io.emit('userList', Array.from(connectedUsers.values()));
        
        // Emit user left to all rooms
        io.emit('userLeft', { userId, userName, timestamp: new Date() });
      });
    });

    // Clean up typing indicators every 10 seconds
    setInterval(() => {
      const now = Date.now();
      for (const [userId, typingData] of typingUsers.entries()) {
        if (now - typingData.timestamp > 5000) { // 5 seconds timeout
          typingUsers.delete(userId);
          io.emit('userStoppedTyping', { 
            userId, 
            userName: typingData.userName 
          });
        }
      }
    }, 10000);

    // --- END SOCKET.IO SETUP ---

    server.listen(PORT, () => {
      console.log(`🚀 Serveur Edu4All démarré sur http://localhost:${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT reçu, arrêt gracieux...');
  process.exit(0);
});

startServer();
