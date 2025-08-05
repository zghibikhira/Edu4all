import React, { useState } from 'react';
import Chat from './Chat';

export default function CourseChat({ courseId, courseTitle }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Ouvrir le chat du cours"
      >
        {isOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-96 h-96 bg-white rounded-lg shadow-xl border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Chat - {courseTitle}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="h-80">
            <Chat courseId={courseId} room={`course_${courseId}`} />
          </div>
        </div>
      )}
    </div>
  );
} 