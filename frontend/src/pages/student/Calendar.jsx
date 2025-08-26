import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaVideo,
  FaBook,
  FaPlus,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true);
        // Mock data for calendar events
        const mockEvents = [
          {
            id: 1,
            title: 'Tutoring Session - Math',
            teacher: 'Dr. Sarah Johnson',
            date: '2025-08-25',
            time: '14:00',
            duration: 60,
            type: 'meeting',
            status: 'confirmed'
          },
          {
            id: 2,
            title: 'JavaScript Course',
            teacher: 'Prof. Michael Chen',
            date: '2025-08-26',
            time: '10:00',
            duration: 90,
            type: 'course',
            status: 'scheduled'
          },
          {
            id: 3,
            title: 'Physics Lab',
            teacher: 'Dr. Robert Wilson',
            date: '2025-08-27',
            time: '16:00',
            duration: 120,
            type: 'lab',
            status: 'confirmed'
          },
          {
            id: 4,
            title: 'React Project Review',
            teacher: 'Prof. Emily Davis',
            date: '2025-08-28',
            time: '15:30',
            duration: 45,
            type: 'review',
            status: 'pending'
          }
        ];

        setEvents(mockEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error loading calendar:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadCalendarData();
    }
  }, [user]);

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'course': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'lab': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'review': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success';
      case 'scheduled': return 'text-primary';
      case 'pending': return 'text-warning';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'scheduled': return 'Programmé';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mon Calendrier
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gérez votre emploi du temps et vos rendez-vous
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/sessions"
                className="btn-primary flex items-center gap-2"
              >
                <FaPlus />
                Réserver un meeting
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Calendar Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'day'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Jour
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid gap-6">
          {/* Today's Events */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Événements d'aujourd'hui
            </h3>
            {events.filter(event => event.date === new Date().toISOString().split('T')[0]).length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Aucun événement prévu aujourd'hui.
              </p>
            ) : (
              <div className="space-y-4">
                {events
                  .filter(event => event.date === new Date().toISOString().split('T')[0])
                  .map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                          <FaCalendarAlt className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {event.teacher} • {formatTime(event.time)} ({event.duration} min)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                        <button className="btn-secondary">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Prochains événements
            </h3>
            <div className="space-y-4">
              {events
                .filter(event => new Date(event.date) > new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                        <FaCalendarAlt className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.teacher} • {formatDate(event.date)} à {formatTime(event.time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                      <button className="btn-secondary">
                        Voir détails
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/sessions" className="card-hover p-6 text-center group">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaVideo className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Réserver un meeting
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Planifier une session avec un enseignant
              </p>
            </Link>

            <Link to="/courses" className="card-hover p-6 text-center group">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaBook className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Voir mes cours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consulter mes cours programmés
              </p>
            </Link>

            <Link to="/evaluations" className="card-hover p-6 text-center group">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaCalendarAlt className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Mes évaluations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gérer mes évaluations et deadlines
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
