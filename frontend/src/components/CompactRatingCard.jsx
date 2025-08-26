import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

export default function CompactRatingCard({
  courseTitle = 'Cours',
  courseSubtitle = '',
  whenLabel = '',
  teacherId,
  courseId = null,
  onSubmitted = () => {},
  onCancel = () => {}
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!teacherId || rating === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/teacher-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          teacherId,
          courseId,
          overallRating: rating,
          criteria: {},
          comment: comment.trim(),
          wouldRecommend: rating >= 4
        })
      });
      const data = await res.json();
      if (data?.success) {
        onSubmitted(data);
      } else {
        alert(data?.message || 'Erreur lors de l\'envoi de l\'évaluation');
      }
    } catch (e) {
      console.error('Rating submit error', e);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Évaluation des Cours/Enseignants</h2>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{courseTitle}</div>
        {courseSubtitle && (
          <div className="text-gray-600 dark:text-gray-300 mt-1">{courseSubtitle}</div>
        )}
        {whenLabel && (
          <div className="text-sm text-gray-500 mt-2">{whenLabel}</div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Notez l’enseignant</div>
        <div className="flex items-center gap-6">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`Note ${n}`}
              className="focus:outline-none"
            >
              <FaStar className={`w-10 h-10 ${n <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <textarea
          className="w-full min-h-[140px] rounded-xl border border-gray-300 dark:border-gray-600 p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
          placeholder="Laissez un commentaire"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={loading || rating === 0 || !teacherId}
          onClick={submit}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-60"
        >
          {loading ? 'Envoi...' : 'Valider'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}


