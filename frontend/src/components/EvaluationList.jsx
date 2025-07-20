import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EvaluationList = ({ userRole = 'student' }) => {
  // const { user } = useAuth(); // Will be used when connecting to real API
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockEvaluations = [
      {
        _id: '1',
        title: 'Devoir de mathématiques - Chapitre 5',
        description: 'Résolution d\'équations du second degré',
        type: 'devoir',
        status: 'en_attente',
        maxScore: 100,
        score: null,
        dueDate: '2024-01-15T23:59:00.000Z',
        submittedAt: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        student: {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          avatar: null
        },
        teacher: {
          _id: '2',
          firstName: 'Marie',
          lastName: 'Martin',
          avatar: null
        },
        course: {
          _id: '1',
          title: 'Mathématiques Avancées'
        }
      },
      {
        _id: '2',
        title: 'Projet de programmation web',
        description: 'Création d\'un site e-commerce avec React',
        type: 'projet',
        status: 'soumis',
        maxScore: 100,
        score: 85,
        dueDate: '2024-01-10T23:59:00.000Z',
        submittedAt: '2024-01-08T14:30:00.000Z',
        createdAt: '2024-01-01T10:00:00.000Z',
        student: {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          avatar: null
        },
        teacher: {
          _id: '3',
          firstName: 'Pierre',
          lastName: 'Bernard',
          avatar: null
        },
        course: {
          _id: '3',
          title: 'Programmation Web'
        }
      },
      {
        _id: '3',
        title: 'Examen de physique',
        description: 'Mécanique quantique et relativité',
        type: 'examen',
        status: 'corrige',
        maxScore: 100,
        score: 92,
        dueDate: '2024-01-05T23:59:00.000Z',
        submittedAt: '2024-01-05T15:45:00.000Z',
        createdAt: '2024-01-01T10:00:00.000Z',
        student: {
          _id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          avatar: null
        },
        teacher: {
          _id: '4',
          firstName: 'Sophie',
          lastName: 'Dubois',
          avatar: null
        },
        course: {
          _id: '2',
          title: 'Physique Quantique'
        }
      }
    ];

    setEvaluations(mockEvaluations);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'soumis':
        return 'bg-blue-100 text-blue-800';
      case 'corrige':
        return 'bg-green-100 text-green-800';
      case 'en_retard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'soumis':
        return 'Soumis';
      case 'corrige':
        return 'Corrigé';
      case 'en_retard':
        return 'En retard';
      default:
        return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'devoir':
        return '📝';
      case 'examen':
        return '📋';
      case 'projet':
        return '💻';
      case 'presentation':
        return '🎤';
      case 'quiz':
        return '❓';
      default:
        return '📄';
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesFilter = filter === 'all' || evaluation.status === filter;
    const matchesSearch = evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         evaluation.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate, evaluationStatus) => {
    return new Date(dueDate) < new Date() && evaluationStatus === 'en_attente';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {userRole === 'teacher' ? 'Mes évaluations créées' : 'Mes évaluations'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'teacher' 
              ? 'Gérez les évaluations que vous avez créées'
              : 'Suivez vos évaluations et leurs résultats'
            }
          </p>
        </div>
        
        {userRole === 'teacher' && (
          <Link
            to="/evaluations/create"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Créer une évaluation
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une évaluation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="soumis">Soumis</option>
              <option value="corrige">Corrigé</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Aucune évaluation trouvée
            </h3>
            <p className="text-gray-600">
              {searchQuery || filter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Vous n\'avez pas encore d\'évaluations'
              }
            </p>
          </div>
        ) : (
          filteredEvaluations.map((evaluation) => (
            <div
              key={evaluation._id}
              className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
                isOverdue(evaluation.dueDate, evaluation.status) ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(evaluation.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {evaluation.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                      {getStatusText(evaluation.status)}
                    </span>
                    {isOverdue(evaluation.dueDate) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        En retard
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{evaluation.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cours:</span> {evaluation.course?.title || 'Aucun cours'}
                    </div>
                    <div>
                      <span className="font-medium">Date limite:</span> {formatDate(evaluation.dueDate)}
                    </div>
                    <div>
                      <span className="font-medium">Note max:</span> {evaluation.maxScore}/100
                    </div>
                  </div>

                  {evaluation.score !== null && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800">Note obtenue:</span>
                        <span className="text-lg font-bold text-green-800">
                          {evaluation.score}/{evaluation.maxScore}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(evaluation.score / evaluation.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {evaluation.submittedAt && (
                    <div className="mt-2 text-sm text-gray-500">
                      Soumis le: {formatDate(evaluation.submittedAt)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    to={`/evaluations/${evaluation._id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Voir détails
                  </Link>
                  
                  {userRole === 'teacher' && evaluation.status === 'soumis' && (
                    <Link
                      to={`/evaluations/${evaluation._id}/grade`}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Corriger
                    </Link>
                  )}
                  
                  {userRole === 'student' && evaluation.status === 'en_attente' && (
                    <Link
                      to={`/evaluations/${evaluation._id}/submit`}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                    >
                      Soumettre
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EvaluationList; 