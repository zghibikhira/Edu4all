import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaVideo, FaCalendar, FaClock, FaUsers, FaEuroSign, FaPlay, FaEye, FaSignInAlt, FaDownload } from 'react-icons/fa';
import TeacherRatingForm from '../../components/TeacherRatingForm';

const VideoSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (user && user.role === 'etudiant') {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions?type=upcoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const sessionsData = data.data?.sessions || data.sessions || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setSessions(prev => prev.map(s => 
          s._id === sessionId ? { ...s, enrolledStudents: [...(s.enrolledStudents || []), user._id] } : s
        ));
        alert('Inscription réussie !');
      } else {
        alert(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Open the session link
        if (data.data.joinLink) {
          window.open(data.data.joinLink, '_blank');
        }
      } else {
        alert(data.message || 'Erreur lors de la connexion à la session');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion à la session:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  const isEnrolled = (session) => {
    return session.enrolledStudents?.includes(user._id) || session.students?.includes(user._id);
  };

  const canJoin = (session) => {
    if (!isEnrolled(session)) return false;
    
    const now = new Date();
    const sessionStart = new Date(session.date);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60000));
    
    return now >= sessionStart && now <= sessionEnd && session.status === 'scheduled';
  };

  const canRate = (session) => {
    const now = new Date();
    const sessionStart = new Date(session.date);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60000));
    return isEnrolled(session) && now > sessionEnd && session.status !== 'cancelled';
  };

  const getTimeStatus = (session) => {
    const now = new Date();
    const sessionStart = new Date(session.date);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60000));
    
    if (now < sessionStart) return 'upcoming';
    if (now >= sessionStart && now <= sessionEnd) return 'ongoing';
    if (now > sessionEnd) return 'finished';
    return 'unknown';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Programmée' },
      ongoing: { color: 'bg-green-100 text-green-800', label: 'En cours' },
      finished: { color: 'bg-purple-100 text-purple-800', label: 'Terminée' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredSessions = Array.isArray(sessions) ? sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.teacherId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.teacherId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  const sortedSessions = [...filteredSessions].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!user || user.role !== 'etudiant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Seuls les étudiants peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
              <FaVideo className="mr-3 text-blue-600" />
              Sessions Visio Disponibles
            </h1>
            <p className="mt-2 text-gray-600">
              Découvrez et rejoignez des sessions de visioconférence avec nos enseignants
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Titre, description ou enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les sessions</option>
                <option value="scheduled">Programmées</option>
                <option value="ongoing">En cours</option>
                <option value="finished">Terminées</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <div className="text-2xl font-bold text-blue-600">
                {filteredSessions.length} sessions
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        {sortedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSessions.map((session) => (
              <div key={session._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Session Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FaVideo className="text-white text-xl" />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(session.status)}
                      {session.isPaid && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          💰 {session.price} {session.currency}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Session Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {session.title}
                  </h3>
                  
                  {session.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {session.description}
                    </p>
                  )}

                  {/* Teacher Info */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {session.teacherId?.firstName?.[0]}{session.teacherId?.lastName?.[0]}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {session.teacherId?.firstName} {session.teacherId?.lastName}
                    </span>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <FaCalendar className="text-gray-400" />
                      <span>
                        {new Date(session.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400" />
                      <span>
                        {new Date(session.date).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} ({session.duration} min)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FaUsers className="text-gray-400" />
                      <span>
                        {session.students?.length || 0} / {session.maxParticipants} participants
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📱</span>
                      <span className="capitalize">{session.platform}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {session.tags && session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {session.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {session.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{session.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    {/* View Details */}
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowSessionModal(true);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      <FaEye className="mr-2" />
                      Voir les détails
                    </button>

                    {/* Enroll or Join */}
                    {!isEnrolled(session) ? (
                      <button
                        onClick={() => handleEnroll(session._id)}
                        disabled={session.status !== 'scheduled'}
                        className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          session.status === 'scheduled'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FaSignInAlt className="mr-2" />
                        {session.isPaid ? 'S\'inscrire' : 'Rejoindre gratuitement'}
                      </button>
                    ) : canJoin(session) ? (
                      <button
                        onClick={() => handleJoinSession(session._id)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <FaPlay className="mr-2" />
                        Rejoindre maintenant
                      </button>
                    ) : canRate(session) ? (
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowRatingModal(true);
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Noter la session
                      </button>
                    ) : (
                      <div className="text-center">
                        <span className="text-sm text-gray-500">
                          {getTimeStatus(session) === 'upcoming' ? 'Inscrit - En attente' : 'Session terminée'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune session trouvée</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Aucune session ne correspond à vos critères de recherche.'
                : 'Aucune session de visioconférence n\'est disponible pour le moment.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h2>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Session Details */}
              <div className="space-y-4">
                {selectedSession.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedSession.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Informations</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FaCalendar className="text-gray-400" />
                        <span>Date: {new Date(selectedSession.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-gray-400" />
                        <span>Heure: {new Date(selectedSession.date).toLocaleTimeString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-gray-400" />
                        <span>Durée: {selectedSession.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUsers className="text-gray-400" />
                        <span>Participants: {selectedSession.students?.length || 0} / {selectedSession.maxParticipants}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Enseignant</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {selectedSession.teacherId?.firstName?.[0]}{selectedSession.teacherId?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedSession.teacherId?.firstName} {selectedSession.teacherId?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedSession.teacherId?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Materials */}
                {selectedSession.materials && selectedSession.materials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Matériaux de cours</h3>
                    <div className="space-y-2">
                      {selectedSession.materials.map((material, index) => (
                        <a
                          key={index}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <FaDownload className="text-blue-600" />
                          <span className="text-blue-600 hover:text-blue-800">
                            {material.title}
                          </span>
                          {material.description && (
                            <span className="text-sm text-gray-500">- {material.description}</span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedSession.tags && selectedSession.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                
                {!isEnrolled(selectedSession) ? (
                  <button
                    onClick={() => {
                      handleEnroll(selectedSession._id);
                      setShowSessionModal(false);
                    }}
                    disabled={selectedSession.status !== 'scheduled'}
                    className={`px-6 py-2 rounded-md font-medium ${
                      selectedSession.status === 'scheduled'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedSession.isPaid ? 'S\'inscrire' : 'Rejoindre gratuitement'}
                  </button>
                ) : canJoin(selectedSession) ? (
                  <button
                    onClick={() => {
                      handleJoinSession(selectedSession._id);
                      setShowSessionModal(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Rejoindre maintenant
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Noter la session</h2>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <TeacherRatingForm
                teacherId={selectedSession.teacherId?._id || selectedSession.teacherId}
                sessionId={selectedSession._id}
                onCancel={() => setShowRatingModal(false)}
                onSubmit={async (ratingData) => {
                  const res = await fetch('/api/teacher-ratings', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(ratingData)
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert('Merci pour votre évaluation !');
                    setShowRatingModal(false);
                  } else {
                    alert(data.message || 'Erreur lors de l\'envoi de l\'évaluation');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSessions;
