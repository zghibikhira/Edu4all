import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

export default function Chat({ courseId = null, receiverId = null, room = 'general' }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Chat - Token from localStorage:', token ? 'Present' : 'Missing');
    
    if (!token) {
      setError('Vous devez être connecté pour utiliser le chat.');
      return;
    }

    console.log('Chat - Connecting to Socket.IO with token');
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setLoading(false);
      
      // Join specific room if provided
      if (courseId || room !== 'general') {
        newSocket.emit('joinRoom', { room, courseId });
      }
      
      // Join direct message if receiverId provided
      if (receiverId) {
        newSocket.emit('joinDirectMessage', receiverId);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Erreur de connexion au chat: ' + err.message);
      setLoading(false);
    });

    newSocket.on('messageError', (data) => {
      console.error('Message error:', data);
      setError('Erreur lors de l\'envoi du message: ' + data.error);
    });

    // Message events
    newSocket.on('messageHistory', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    newSocket.on('newMessage', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
      
      // Show notification if message is from someone else
      if (newMessage.sender._id !== user?.id) {
        showNotification(`${newMessage.sender.name}: ${newMessage.content}`);
      }
    });

    newSocket.on('messageEdited', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: data.content, edited: data.edited, editedAt: data.editedAt }
          : msg
      ));
    });

    newSocket.on('messageDeleted', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // User events
    newSocket.on('userList', (users) => {
      setConnectedUsers(users);
    });

    newSocket.on('userJoined', (data) => {
      showNotification(`${data.userName} a rejoint le chat`);
    });

    newSocket.on('userLeft', (data) => {
      showNotification(`${data.userName} a quitté le chat`);
    });

    // Typing events
    newSocket.on('userTyping', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { userId: data.userId, userName: data.userName }];
        });
      }
    });

    newSocket.on('userStoppedTyping', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Notification events
    newSocket.on('notification', (notif) => {
      showNotification(notif.message);
    });

    // Error events
    newSocket.on('messageError', (error) => {
      showNotification('Erreur: ' + error.error, 'error');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, courseId, receiverId, room]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { room, receiverId, courseId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('stopTyping', { room, receiverId, courseId });
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !socket) return;

    console.log('Sending message:', {
      content: message.trim(),
      room,
      receiverId,
      courseId,
      messageType: 'text'
    });

    socket.emit('sendMessage', {
      content: message.trim(),
      room,
      receiverId,
      courseId,
      messageType: 'text'
    });

    setMessage('');
    
    // Stop typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stopTyping', { room, receiverId, courseId });
  };

  const editMessage = (messageId, newContent) => {
    socket?.emit('editMessage', {
      messageId,
      newContent,
      room,
      receiverId,
      courseId
    });
  };

  const deleteMessage = (messageId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      socket?.emit('deleteMessage', {
        messageId,
        room,
        receiverId,
        courseId
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const isOwnMessage = (message) => {
    return message.sender._id === user?.id;
  };

  const canEditMessage = (message) => {
    return isOwnMessage(message) && !message.edited;
  };

  const canDeleteMessage = (message) => {
    return isOwnMessage(message);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de connexion</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {courseId ? 'Chat du cours' : receiverId ? 'Message privé' : 'Chat général'}
            </h2>
            <p className="text-sm text-gray-600">
              {connectedUsers.length} utilisateur(s) connecté(s)
            </p>
            </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">En ligne</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucun message pour le moment. Commencez la conversation !
            </div>
          ) : (
            messages.map((msg, index) => {
              const showDate = index === 0 || 
                formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);
              
              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 my-4">
                      {formatDate(msg.createdAt)}
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage(msg) 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {!isOwnMessage(msg) && (
                        <div className="text-xs font-medium mb-1 text-gray-600">
                          {msg.sender.name}
                        </div>
                      )}
                      
                      <div className="text-sm">
                        {msg.content}
                        {msg.edited && (
                          <span className="text-xs opacity-75 ml-2">(modifié)</span>
                        )}
                      </div>
                      
                      <div className="text-xs opacity-75 mt-1">
                        {formatTime(msg.createdAt)}
                      </div>
                      
                      {/* Message Actions */}
                      {(canEditMessage(msg) || canDeleteMessage(msg)) && (
                        <div className="flex space-x-2 mt-2">
                          {canEditMessage(msg) && (
                            <button
                              onClick={() => {
                                const newContent = prompt('Modifier le message:', msg.content);
                                if (newContent && newContent.trim() !== msg.content) {
                                  editMessage(msg._id, newContent.trim());
                                }
                              }}
                              className="text-xs underline hover:no-underline"
                            >
                              Modifier
                            </button>
                          )}
                          {canDeleteMessage(msg) && (
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              className="text-xs underline hover:no-underline text-red-400"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'écrit' : 'écrivent'}...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
        <input
              ref={messageInputRef}
              type="text"
          value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Écrire un message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!socket}
            />
            <button
              type="submit"
              disabled={!message.trim() || !socket}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Envoyer
            </button>
      </form>
        </div>
      </div>

      {/* Connected Users */}
      {connectedUsers.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold mb-3">Utilisateurs connectés</h3>
          <div className="flex flex-wrap gap-2">
            {connectedUsers.map((user) => (
              <div key={user.socketId} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{user.name}</span>
                {user.role && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}