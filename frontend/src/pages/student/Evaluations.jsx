import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaClipboardList, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaStar,
  FaCalendarAlt,
  FaUser,
  FaBook
} from 'react-icons/fa';

const Evaluations = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadEvaluations = async () => {
      try {
        setLoading(true);
        // Mock data for now - replace with API call
        const mockEvaluations = [
          {
            id: 1,
            title: 'Math Quiz - Algebra Basics',
            course: 'Mathematics',
            teacher: 'Dr. Sarah Johnson',
            dueDate: '2025-08-25',
            status: 'pending',
            score: null,
            maxScore: 100,
            type: 'quiz'
          },
          {
            id: 2,
            title: 'JavaScript Fundamentals Test',
            course: 'Programming',
            teacher: 'Prof. Michael Chen',
            dueDate: '2025-08-22',
            status: 'completed',
            score: 85,
            maxScore: 100,
            type: 'test'
          },
          {
            id: 3,
            title: 'React Project Assignment',
            course: 'Web Development',
            teacher: 'Prof. Emily Davis',
            dueDate: '2025-08-30',
            status: 'in-progress',
            score: null,
            maxScore: 100,
            type: 'project'
          },
          {
            id: 4,
            title: 'Physics Lab Report',
            course: 'Physics',
            teacher: 'Dr. Robert Wilson',
            dueDate: '2025-08-20',
            status: 'completed',
            score: 92,
            maxScore: 100,
            type: 'report'
          }
        ];

        setEvaluations(mockEvaluations);
        setLoading(false);
      } catch (error) {
        console.error('Error loading evaluations:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadEvaluations();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in-progress': return 'text-warning';
      case 'pending': return 'text-primary';
      case 'overdue': return 'text-danger';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="w-5 h-5 text-success" />;
      case 'in-progress': return <FaClock className="w-5 h-5 text-warning" />;
      case 'pending': return <FaExclamationTriangle className="w-5 h-5 text-primary" />;
      case 'overdue': return <FaExclamationTriangle className="w-5 h-5 text-danger" />;
      default: return <FaClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filter === 'all') return true;
    return evaluation.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement des évaluations...</p>
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
                Mes Évaluations
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gérez vos évaluations et suivez votre progression
              </p>
            </div>
            <Link
              to="/create-evaluation"
              className="btn-primary flex items-center gap-2"
            >
              <FaClipboardList />
              Créer une évaluation
            </Link>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Toutes ({evaluations.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              En attente ({evaluations.filter(e => e.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'in-progress'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              En cours ({evaluations.filter(e => e.status === 'in-progress').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Terminées ({evaluations.filter(e => e.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Evaluations List */}
        <div className="grid gap-6">
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <FaClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune évaluation trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Vous n\'avez pas encore d\'évaluations assignées.'
                  : `Aucune évaluation ${filter === 'pending' ? 'en attente' : filter === 'in-progress' ? 'en cours' : 'terminée'}.`
                }
              </p>
            </div>
          ) : (
            filteredEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(evaluation.status)}
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {evaluation.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                        {getStatusText(evaluation.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FaBook className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {evaluation.course}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {evaluation.teacher}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Échéance: {new Date(evaluation.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    {evaluation.status === 'completed' && evaluation.score !== null && (
                      <div className="flex items-center gap-2 mb-4">
                        <FaStar className="w-4 h-4 text-yellow-500" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Score: {evaluation.score}/{evaluation.maxScore}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({Math.round((evaluation.score / evaluation.maxScore) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {evaluation.status === 'pending' && (
                      <button className="btn-primary">
                        Commencer
                      </button>
                    )}
                    {evaluation.status === 'in-progress' && (
                      <button className="btn-primary">
                        Continuer
                      </button>
                    )}
                    {evaluation.status === 'completed' && (
                      <button className="btn-secondary">
                        Voir les détails
                      </button>
                    )}
                    <button className="btn-secondary">
                      Voir le cours
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Statistiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {evaluations.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Total des évaluations
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {evaluations.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Terminées
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                {evaluations.filter(e => e.status === 'in-progress').length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                En cours
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {evaluations.filter(e => e.status === 'pending').length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                En attente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluations; 