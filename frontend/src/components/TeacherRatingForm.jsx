import React, { useState } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const TeacherRatingForm = ({ teacherId, onSubmit, onCancel, sessionId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [criteria, setCriteria] = useState({
    teachingQuality: 0,
    communication: 0,
    availability: 0,
    organization: 0,
    feedback: 0
  });
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCriteriaChange = (criterion, value) => {
    setCriteria(prev => ({
      ...prev,
      [criterion]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Veuillez donner une note globale');
      return;
    }

    if (wouldRecommend === null) {
      alert('Veuillez indiquer si vous recommandez cet enseignant');
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        teacherId,
        sessionId,
        overallRating: rating,
        criteria,
        comment: comment.trim(),
        wouldRecommend
      };

      await onSubmit(ratingData);
      
      // Reset form
      setRating(0);
      setCriteria({
        teachingQuality: 0,
        communication: 0,
        availability: 0,
        organization: 0,
        feedback: 0
      });
      setComment('');
      setWouldRecommend(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange, size = 'w-6 h-6') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <FaStar
              className={`${size} ${
                star <= (hoverRating || value)
                  ? 'text-yellow-500'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Évaluer cet enseignant
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note globale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Note globale *
          </label>
          <div className="flex items-center gap-4">
            {renderStars(rating, setRating, 'w-8 h-8')}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rating > 0 && `${rating}/5 étoiles`}
            </span>
          </div>
        </div>

        {/* Critères détaillés */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Critères détaillés
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualité d'enseignement
              </label>
              {renderStars(criteria.teachingQuality, (value) => handleCriteriaChange('teachingQuality', value))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Communication
              </label>
              {renderStars(criteria.communication, (value) => handleCriteriaChange('communication', value))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Disponibilité
              </label>
              {renderStars(criteria.availability, (value) => handleCriteriaChange('availability', value))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organisation
              </label>
              {renderStars(criteria.organization, (value) => handleCriteriaChange('organization', value))}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualité des retours
              </label>
              {renderStars(criteria.feedback, (value) => handleCriteriaChange('feedback', value))}
            </div>
          </div>
        </div>

        {/* Recommandation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recommanderiez-vous cet enseignant ? *
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                wouldRecommend === true
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FaThumbsUp className="w-4 h-4" />
              <span>Oui, je recommande</span>
            </button>
            
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                wouldRecommend === false
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FaThumbsDown className="w-4 h-4" />
              <span>Non, je ne recommande pas</span>
            </button>
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Partagez votre expérience avec cet enseignant..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Maximum 1000 caractères
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || rating === 0 || wouldRecommend === null}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Envoi...' : 'Envoyer l\'évaluation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherRatingForm;
