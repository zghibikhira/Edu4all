import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const NotificationToast = ({ notification, onClose, onMarkAsRead }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.priority) {
      case 'urgent':
      case 'high':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'normal':
        return <FaInfoCircle className="text-blue-500" />;
      case 'low':
        return <FaCheck className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  // Get background color based on priority
  const getBackgroundColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'normal':
        return 'bg-blue-50 border-blue-200';
      case 'low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Get icon color based on priority
  const getIconColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 w-80 max-w-sm bg-white border rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getBackgroundColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-center space-x-2">
          <div className={`text-lg ${getIconColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            <p className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {isExpanded ? notification.body : `${notification.body.substring(0, 100)}...`}
        </p>
        
        {notification.body.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 transition-colors"
          >
            {isExpanded ? 'Voir moins' : 'Voir plus'}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {!notification.readAt && (
              <button
                onClick={handleMarkAsRead}
                className="text-xs text-green-600 hover:text-green-800 transition-colors flex items-center space-x-1"
              >
                <FaCheck className="text-xs" />
                <span>Marquer comme lu</span>
              </button>
            )}
          </div>
          
          {notification.link && (
            <a
              href={notification.link}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Voir plus →
            </a>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-5000 ease-linear"
          style={{
            width: '100%',
            animation: 'shrink 5s linear forwards'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container
const NotificationToastContainer = ({ notifications, onClose, onMarkAsRead }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationToastContainer;
