import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ChatSummary() {
  const { user } = useAuth();
  const [recentMessages, setRecentMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const response = await fetch('/api/messages/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Erreur fetchRecentMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Messages récents</h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {recentMessages.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">💬</div>
          <p className="text-gray-500 text-sm">Aucun message récent</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {recentMessages.slice(0, 3).map((msg) => (
            <div key={msg._id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm font-medium">
                  {msg.sender?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {msg.sender?.name || 'Utilisateur'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {truncateMessage(msg.content)}
                </p>
                {msg.room && msg.room !== 'general' && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                    {msg.room}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <Link
          to="/chat"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block text-sm font-medium"
        >
          Ouvrir le chat complet
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex space-x-2">
        <Link
          to="/chat"
          className="flex-1 text-center text-xs text-blue-600 hover:text-blue-800 py-1 px-2 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          Chat général
        </Link>
        {user?.role === 'student' && (
          <Link
            to="/courses"
            className="flex-1 text-center text-xs text-green-600 hover:text-green-800 py-1 px-2 rounded border border-green-200 hover:bg-green-50 transition-colors"
          >
            Cours
          </Link>
        )}
      </div>
    </div>
  );
} 