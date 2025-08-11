import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaThumbsUp, FaThumbsDown, FaCheckCircle } from 'react-icons/fa';

const TeacherRatingForm = ({ teacher, course, onRatingSubmitted, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    overallRating: 0,
    criteria: {
      teachingQuality: 0,
      communication: 0,
      availability: 0,
      organization: 0,
      feedback: 0
    },
    comment: '',
    wouldRecommend: true
  });

  const criteriaLabels = {
    teachingQuality: 'Qualité d\'enseignement',
    communication: 'Communication',
    availability: 'Disponibilité',
    organization: 'Organisation',
    feedback: 'Retour et feedback'
  };

  const handleRatingChange = (field, value) => {
    if (field === 'overallRating') {
      setFormData(prev => ({ ...prev, overallRating: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        criteria: { ...prev.criteria, [field]: value }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.overallRating === 0) {
      alert('Veuillez donner une note globale');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/teacher-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          teacherId: teacher._id,
          courseId: course?._id,
          overallRating: formData.overallRating,
          criteria: formData.criteria,
          comment: formData.comment,
          wouldRecommend: formData.wouldRecommend
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onRatingSubmitted(data.data);
        onClose();
      } else {
        alert(data.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la soumission de l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange, size = 'text-xl') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${size} transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  if (!user || user.role !== 'etudiant') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Seuls les étudiants peuvent évaluer les enseignants</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Évaluer {teacher.firstName} {teacher.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {course && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Cours: {course.title}</h3>
              <p className="text-blue-700 text-sm">{course.description}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note globale */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Note globale *
              </label>
              <div className="flex items-center gap-4">
                {renderStars(formData.overallRating, (value) => handleRatingChange('overallRating', value), 'text-3xl')}
                <span className="text-2xl font-bold text-gray-700">
                  {formData.overallRating}/5
                </span>
              </div>
            </div>

            {/* Critères détaillés */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Critères détaillés
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(criteriaLabels).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      {renderStars(
                        formData.criteria[key],
                        (value) => handleRatingChange(key, value),
                        'text-lg'
                      )}
                      <span className="text-sm font-medium text-gray-600">
                        {formData.criteria[key]}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommandation */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Recommandation
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommendation"
                    value="true"
                    checked={formData.wouldRecommend === true}
                    onChange={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                    className="text-blue-600"
                  />
                  <FaThumbsUp className="text-green-500" />
                  <span>Je recommande</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommendation"
                    value="false"
                    checked={formData.wouldRecommend === false}
                    onChange={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                    className="text-blue-600"
                  />
                  <FaThumbsDown className="text-red-500" />
                  <span>Je ne recommande pas</span>
                </label>
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Commentaire (optionnel)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Partagez votre expérience avec cet enseignant..."
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.comment.length}/1000
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || formData.overallRating === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Soumettre l'évaluation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherRatingForm;
