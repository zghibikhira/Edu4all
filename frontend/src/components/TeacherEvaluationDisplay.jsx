import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teacherRatingAPI } from '../utils/api';
import { FaStar, FaThumbsUp, FaThumbsDown, FaUserGraduate, FaChartBar } from 'react-icons/fa';

const TeacherEvaluationDisplay = ({ teacherId, showRatingForm = false, onRatingSubmitted }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(showRatingForm);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRatings();
    fetchStats();
  }, [teacherId, page]);

  const fetchRatings = async () => {
    try {
      const response = await teacherRatingAPI.getTeacherRatings(teacherId, {
        page,
        limit: 10,
        status: 'approved'
      });
      
      if (response.data.success) {
        if (page === 1) {
          setRatings(response.data.data);
        } else {
          setRatings(prev => [...prev, ...response.data.data]);
        }
        setHasMore(response.data.pagination?.hasNext || false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await teacherRatingAPI.getTeacherStats(teacherId);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleRatingSubmitted = (newRating) => {
    setRatings(prev => [newRating, ...prev]);
    fetchStats();
    setShowForm(false);
    if (onRatingSubmitted) {
      onRatingSubmitted(newRating);
    }
  };

  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${size} ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const getCriteriaLabel = (key) => {
    const labels = {
      teachingQuality: 'Qualité d\'enseignement',
      communication: 'Communication',
      availability: 'Disponibilité',
      organization: 'Organisation',
      feedback: 'Retour et feedback'
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartBar className="mr-2 text-blue-600" />
            Statistiques d'évaluation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mt-2">
                {renderStars(Math.round(stats.averageRating || 0), 'text-lg')}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Note moyenne ({stats.totalRatings || 0} évaluations)
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((stats.recommendationRate || 0) * 100)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Recommandation
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalRatings || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Total évaluations
              </p>
            </div>
          </div>

          {/* Detailed Criteria */}
          {stats.averageTeachingQuality && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Critères détaillés</h4>
              <div className="space-y-3">
                {Object.entries({
                  teachingQuality: stats.averageTeachingQuality,
                  communication: stats.averageCommunication,
                  availability: stats.averageAvailability,
                  organization: stats.averageOrganization,
                  feedback: stats.averageFeedback
                }).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{getCriteriaLabel(key)}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(Math.round(value || 0), 'text-sm')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {value?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Form */}
      {user && user.role === 'etudiant' && !showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Évaluer cet enseignant
          </button>
        </div>
      )}

      {/* Ratings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUserGraduate className="mr-2 text-blue-600" />
            Avis des étudiants ({ratings.length})
          </h3>
        </div>

        {ratings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <div key={rating._id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {rating.student?.firstName?.[0]}{rating.student?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {rating.student?.firstName} {rating.student?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(rating.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating.overallRating, 'text-lg')}
                  </div>
                </div>

                {rating.comment && (
                  <p className="text-gray-700 mb-3">{rating.comment}</p>
                )}

                {/* Detailed Criteria */}
                {rating.criteria && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    {Object.entries(rating.criteria).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{getCriteriaLabel(key)}</div>
                        <div className="flex justify-center">
                          {renderStars(value, 'text-xs')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    {rating.wouldRecommend ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <FaThumbsUp className="mr-1" />
                        Recommande
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm">
                        <FaThumbsDown className="mr-1" />
                        Ne recommande pas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Aucune évaluation pour le moment
          </div>
        )}

        {hasMore && (
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Charger plus d'évaluations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherEvaluationDisplay;
