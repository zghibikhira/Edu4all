import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import ComplaintForm from './ComplaintForm';

const ReportButton = ({ 
  againstUserId = null, 
  orderId = null, 
  sessionId = null, 
  courseId = null,
  className = '',
  variant = 'default' // 'default', 'small', 'icon'
}) => {
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const handleReport = () => {
    setShowComplaintForm(true);
  };

  const handleComplaintSuccess = () => {
    setShowComplaintForm(false);
    // You can add a success notification here
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'small':
        return (
          <span className="flex items-center space-x-1 text-xs">
            <FaExclamationTriangle className="text-xs" />
            <span>Signaler</span>
          </span>
        );
      case 'icon':
        return <FaExclamationTriangle className="text-sm" />;
      default:
        return (
          <span className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-sm" />
            <span>Signaler un problème</span>
          </span>
        );
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
    
    switch (variant) {
      case 'small':
        return `${baseClasses} px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded`;
      case 'icon':
        return `${baseClasses} p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full`;
      default:
        return `${baseClasses} px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300`;
    }
  };

  return (
    <>
      <button
        onClick={handleReport}
        className={`${getButtonClasses()} ${className}`}
        title="Signaler un problème"
      >
        {getButtonContent()}
      </button>

      <ComplaintForm
        isOpen={showComplaintForm}
        onClose={() => setShowComplaintForm(false)}
        onSuccess={handleComplaintSuccess}
        againstUserId={againstUserId}
        orderId={orderId}
        sessionId={sessionId}
        courseId={courseId}
      />
    </>
  );
};

export default ReportButton;
