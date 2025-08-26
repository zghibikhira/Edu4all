import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreateVideoSession from '../../components/CreateVideoSession';
import { FaVideo, FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaCalendar, FaClock, FaEuroSign, FaPlay, FaPause, FaStop } from 'react-icons/fa';

const VideoSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (user && user.role === 'enseignant') {
      fetchSessions();
      fetchStats();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions', {
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sessions/stats/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleSessionCreated = (newSession) => {
    setSessions(prev => [newSession, ...prev]);
    fetchStats(); // Refresh stats
  };

  const handlePublishSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessions(prev => prev.map(s => 
          s._id === sessionId ? { ...s, status: 'scheduled' } : s
        ));
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const handleCancelSession = async (sessionId, reason) => {
    if (!reason) {
      reason = prompt('Raison de l\'annulation:');
      if (!reason) return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessions(prev => prev.map(s => 
          s._id === sessionId ? { ...s, status: 'cancelled' } : s
        ));
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessions(prev => prev.filter(s => s._id !== sessionId));
        fetchStats();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
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

  const getTimeStatus = (session) => {
    const now = new Date();
    const sessionStart = new Date(session.date);
    const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60000));
    
    if (now < sessionStart) return 'upcoming';
    if (now >= sessionStart && now <= sessionEnd) return 'ongoing';
    if (now > sessionEnd) return 'finished';
    return 'unknown';
  };

  const filteredSessions = Array.isArray(sessions) ? sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  const sortedSessions = [...filteredSessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!user || user.role !== 'enseignant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Seuls les enseignants peuvent accéder à cette page.</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaVideo className="mr-3 text-blue-600" />
                Mes Sessions Visio
              </h1>
              <p className="mt-2 text-gray-600">
                Gérez vos sessions de visioconférence et suivez la participation des étudiants
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Créer une session
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaVideo className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSessions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCalendar className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À venir</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingSessions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessions.filter(s => s.status === 'ongoing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaEuroSign className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions payantes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessions.filter(s => s.isPaid).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Titre ou description..."
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
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillons</option>
                <option value="scheduled">Programmées</option>
                <option value="ongoing">En cours</option>
                <option value="finished">Terminées</option>
                <option value="cancelled">Annulées</option>
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

        {/* Sessions List */}
        {sortedSessions.length > 0 ? (
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <div key={session._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Session Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FaVideo className="text-white text-2xl" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                          {getStatusBadge(session.status)}
                          {session.isPaid && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              💰 {session.price} {session.currency}
                            </span>
                          )}
                        </div>
                        
                        {session.description && (
                          <p className="text-gray-600 mb-3">{session.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                          <div className="flex flex-wrap gap-2 mt-3">
                            {session.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* View/Edit Session */}
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      <FaEye className="mr-2" />
                      Voir
                    </button>

                    {/* Publish Draft */}
                    {session.status === 'draft' && (
                      <button
                        onClick={() => handlePublishSession(session._id)}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <FaPlay className="mr-2" />
                        Publier
                      </button>
                    )}

                    {/* Cancel Session */}
                    {['scheduled', 'ongoing'].includes(session.status) && (
                      <button
                        onClick={() => handleCancelSession(session._id)}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        <FaPause className="mr-2" />
                        Annuler
                      </button>
                    )}

                    {/* Delete Session */}
                    {session.status === 'draft' && !session.students?.length && (
                      <button
                        onClick={() => handleDeleteSession(session._id)}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        <FaTrash className="mr-2" />
                        Supprimer
                      </button>
                    )}

                    {/* Join Session */}
                    {session.status === 'scheduled' && getTimeStatus(session) === 'ongoing' && (
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FaPlay className="mr-2" />
                        Rejoindre
                      </a>
                    )}
                  </div>
                </div>

                {/* Materials */}
                {session.materials && session.materials.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Matériaux de cours:</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.materials.map((material, index) => (
                        <a
                          key={index}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          {material.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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
                : 'Vous n\'avez pas encore créé de sessions de visioconférence.'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaPlus className="mr-2" />
              Créer votre première session
            </button>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateVideoSession
          onSessionCreated={handleSessionCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default VideoSessions;
