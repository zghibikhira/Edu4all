import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaCalendar, 
  FaClock, 
  FaUser, 
  FaEuroSign, 
  FaCheck, 
  FaTimes,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBook,
  FaStar,
  FaEye,
  FaSignInAlt,
  FaCalendarCheck,
  FaCalendarTimes
} from 'react-icons/fa';

const StudentSlotBooking = () => {
  const { user } = useAuth();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    date: '',
    priceRange: 'all',
    teacher: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, [filters]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.priceRange !== 'all') queryParams.append('priceRange', filters.priceRange);
      if (filters.teacher) queryParams.append('teacher', filters.teacher);

      const response = await fetch(`/api/meetings/slots/available?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (slotId) => {
    if (!user) {
      alert('Vous devez être connecté pour réserver un créneau');
      return;
    }

    try {
      setBookingLoading(true);
      const response = await fetch(`/api/meetings/slots/${slotId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId: user._id,
          message: `Réservation pour ${user.firstName} ${user.lastName}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Réservation effectuée avec succès !');
        setShowSlotModal(false);
        fetchAvailableSlots(); // Refresh the list
      } else {
        alert(data.message || 'Erreur lors de la réservation');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Erreur de connexion');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      level: '',
      date: '',
      priceRange: 'all',
      teacher: ''
    });
    setSearchTerm('');
  };

  const filteredSlots = availableSlots.filter(slot => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const teacherName = `${slot.teacher?.firstName} ${slot.teacher?.lastName}`.toLowerCase();
      const subject = slot.subject?.toLowerCase() || '';
      
      if (!teacherName.includes(searchLower) && !subject.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'booked': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'completed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-100/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'booked': return 'Réservé';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Créneaux disponibles
        </h2>
        <div className="flex items-center gap-2">
          <FaCalendarCheck className="text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredSlots.length} créneaux disponibles
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par enseignant ou matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les matières</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
              <option value="Biologie">Biologie</option>
              <option value="Informatique">Informatique</option>
              <option value="Langues">Langues</option>
              <option value="Histoire">Histoire</option>
              <option value="Géographie">Géographie</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les niveaux</option>
              <option value="primaire">Primaire</option>
              <option value="college">Collège</option>
              <option value="lycee">Lycée</option>
              <option value="superieur">Supérieur</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Prix:</span>
          <select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les prix</option>
            <option value="free">Gratuit</option>
            <option value="0-20">0€ - 20€</option>
            <option value="20-50">20€ - 50€</option>
            <option value="50+">50€+</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSlots.map((slot) => (
          <div key={slot._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            {/* Teacher Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={slot.teacher?.avatar || '/default-avatar.png'}
                alt={`${slot.teacher?.firstName} ${slot.teacher?.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {slot.teacher?.firstName} {slot.teacher?.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaStar className="text-yellow-500" />
                  <span>{slot.teacher?.rating || 0}/5</span>
                  <span>•</span>
                  <span>{slot.teacher?.totalStudents || 0} élèves</span>
                </div>
              </div>
            </div>

            {/* Slot Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendar className="text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDate(slot.date)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FaClock className="text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
              </div>

              {slot.subject && (
                <div className="flex items-center gap-2">
                  <FaBook className="text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {slot.subject}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <FaUser className="text-orange-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  {slot.enrolledStudents?.length || 0}/{slot.maxStudents} étudiants
                </span>
              </div>

              {slot.isPaid && (
                <div className="flex items-center gap-2">
                  <FaEuroSign className="text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    {slot.price}€
                  </span>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                {getStatusText(slot.status)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSlot(slot);
                  setShowSlotModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <FaEye />
                Voir détails
              </button>

              {slot.status === 'available' && (
                <button
                  onClick={() => handleBooking(slot._id)}
                  disabled={bookingLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaSignInAlt />
                  {bookingLoading ? 'Réservation...' : 'Réserver'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSlots.length === 0 && (
        <div className="text-center py-12">
          <FaCalendarTimes className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun créneau disponible
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun créneau ne correspond à vos critères de recherche.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
      )}

      {/* Slot Details Modal */}
      {showSlotModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Détails du créneau
                </h3>
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Teacher Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={selectedSlot.teacher?.avatar || '/default-avatar.png'}
                  alt={`${selectedSlot.teacher?.firstName} ${selectedSlot.teacher?.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSlot.teacher?.firstName} {selectedSlot.teacher?.lastName}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedSlot.teacher?.subjects?.join(', ')}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      {selectedSlot.teacher?.rating || 0}/5
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUser />
                      {selectedSlot.teacher?.totalStudents || 0} élèves
                    </span>
                    {selectedSlot.teacher?.location && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt />
                        {selectedSlot.teacher.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(selectedSlot.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaClock className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaUser className="text-orange-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedSlot.enrolledStudents?.length || 0}/{selectedSlot.maxStudents} étudiants
                    </span>
                  </div>

                  {selectedSlot.isPaid && (
                    <div className="flex items-center gap-2">
                      <FaEuroSign className="text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">
                        {selectedSlot.price}€
                      </span>
                    </div>
                  )}
                </div>

                {selectedSlot.subject && (
                  <div className="flex items-center gap-2">
                    <FaBook className="text-purple-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Matière: {selectedSlot.subject}
                    </span>
                  </div>
                )}

                {selectedSlot.description && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Description:</h5>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedSlot.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Fermer
                </button>

                {selectedSlot.status === 'available' && (
                  <button
                    onClick={() => handleBooking(selectedSlot._id)}
                    disabled={bookingLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Réservation...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt />
                        Réserver ce créneau
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSlotBooking;
