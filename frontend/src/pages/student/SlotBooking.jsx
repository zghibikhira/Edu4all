import React from 'react';
import StudentSlotBooking from '../../components/StudentSlotBooking';

const SlotBooking = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Réserver un créneau
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Trouvez et réservez des créneaux avec nos enseignants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentSlotBooking />
      </div>
    </div>
  );
};

export default SlotBooking;
