import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaCalendar, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaStar,
  FaBook,
  FaEuroSign,
  FaCheckCircle,
  FaTimesCircle,
  FaClock as FaClockIcon,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

const TeacherApplicationsManager = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    slot: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.slot) queryParams.append('slot', filters.slot);

      const response = await fetch(`/api/meetings/applications/teacher?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/meetings/applications/${applicationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Candidature ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès !`);
        setShowApplicationModal(false);
        fetchApplications(); // Refresh the list
      } else {
        alert(data.message || `Erreur lors de l'${action === 'accept' ? 'acceptation' : 'refus'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      alert('Erreur de connexion');
    } finally {
      setActionLoading(false);
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
      status: 'all',
      date: '',
      slot: ''
    });
    setSearchTerm('');
  };

  const filteredApplications = applications.filter(application => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const studentName = `${application.student?.firstName} ${application.student?.lastName}`.toLowerCase();
      const subject = application.slot?.subject?.toLowerCase() || '';
      
      if (!studentName.includes(searchLower) && !subject.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-100/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClockIcon />;
      case 'accepted': return <FaCheckCircle />;
      case 'rejected': return <FaTimesCircle />;
      case 'cancelled': return <FaTimes />;
      default: return <FaClockIcon />;
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
          Gestion des candidatures
        </h2>
        <div className="flex items-center gap-2">
          <FaUser className="text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredApplications.length} candidatures
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par étudiant ou matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="accepted">Acceptées</option>
              <option value="rejected">Refusées</option>
              <option value="cancelled">Annulées</option>
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

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              {/* Student Info */}
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={application.student?.avatar || '/default-avatar.png'}
                  alt={`${application.student?.firstName} ${application.student?.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {application.student?.firstName} {application.student?.lastName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      {getStatusText(application.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-blue-600" />
                      <span>{formatDate(application.slot?.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaClock className="text-green-600" />
                      <span>{formatTime(application.slot?.startTime)} - {formatTime(application.slot?.endTime)}</span>
                    </div>

                    {application.slot?.subject && (
                      <div className="flex items-center gap-2">
                        <FaBook className="text-purple-600" />
                        <span>{application.slot.subject}</span>
                      </div>
                    )}

                    {application.slot?.isPaid && (
                      <div className="flex items-center gap-2">
                        <FaEuroSign className="text-green-600" />
                        <span>{application.slot.price}€</span>
                      </div>
                    )}
                  </div>

                  {application.message && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Message:</strong> {application.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Postulé le {formatDate(application.createdAt)}</span>
                    {application.student?.email && (
                      <span className="flex items-center gap-1">
                        <FaEnvelope />
                        {application.student.email}
                      </span>
                    )}
                    {application.student?.phone && (
                      <span className="flex items-center gap-1">
                        <FaPhone />
                        {application.student.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowApplicationModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                >
                  <FaEye />
                </button>

                {application.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApplicationAction(application._id, 'accept')}
                      disabled={actionLoading}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleApplicationAction(application._id, 'reject')}
                      disabled={actionLoading}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FaUser className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune candidature
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {applications.length === 0 
              ? 'Vous n\'avez pas encore reçu de candidatures pour vos créneaux.'
              : 'Aucune candidature ne correspond à vos critères de recherche.'
            }
          </p>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Détails de la candidature
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Student Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={selectedApplication.student?.avatar || '/default-avatar.png'}
                  alt={`${selectedApplication.student?.firstName} ${selectedApplication.student?.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedApplication.student?.firstName} {selectedApplication.student?.lastName}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedApplication.student?.email}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {selectedApplication.student?.phone && (
                      <span className="flex items-center gap-1">
                        <FaPhone />
                        {selectedApplication.student.phone}
                      </span>
                    )}
                    {selectedApplication.student?.level && (
                      <span className="flex items-center gap-1">
                        <FaBook />
                        {selectedApplication.student.level}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot Info */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Détails du créneau:</h5>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(selectedApplication.slot?.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FaClock className="text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatTime(selectedApplication.slot?.startTime)} - {formatTime(selectedApplication.slot?.endTime)}
                    </span>
                  </div>

                  {selectedApplication.slot?.subject && (
                    <div className="flex items-center gap-2">
                      <FaBook className="text-purple-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedApplication.slot.subject}
                      </span>
                    </div>
                  )}

                  {selectedApplication.slot?.isPaid && (
                    <div className="flex items-center gap-2">
                      <FaEuroSign className="text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">
                        {selectedApplication.slot.price}€
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {selectedApplication.message && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Message de l'étudiant:</h5>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedApplication.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Statut:</h5>
                <span className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${getStatusColor(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)}
                  {getStatusText(selectedApplication.status)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Fermer
                </button>

                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApplicationAction(selectedApplication._id, 'reject')}
                      disabled={actionLoading}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FaTimes />
                      Refuser
                    </button>
                    <button
                      onClick={() => handleApplicationAction(selectedApplication._id, 'accept')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Accepter
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherApplicationsManager;
