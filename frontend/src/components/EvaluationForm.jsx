import React, { useState } from 'react';
import StarRating from './StarRating';

const EvaluationForm = ({ course, session, teacher, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Compose display info
  const title = course?.title || session?.title || '';
  const description = course?.description || session?.description || '';
  const date = session?.date || course?.date;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        rating,
        comment,
        courseId: course?._id,
        sessionId: session?._id,
        teacherId: teacher?._id,
      });
      setRating(0);
      setComment('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-2">
      <h1 className="text-4xl font-bold mb-8 leading-tight">Évaluation des<br/>Cours/Enseignants</h1>
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-2xl font-bold">{title}</div>
            <div className="text-gray-600">{description}</div>
          </div>
          <div className="text-gray-700 font-medium mt-2 md:mt-0">
            {date && new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {date && new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="text-xl font-semibold mb-2">Notez l’enseignant</div>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="mb-6">
            <textarea
              className="w-full border rounded-lg px-4 py-3 text-lg"
              rows={3}
              placeholder="Laissez un commentaire"
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full bg-blue-600 text-white text-xl font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            Valider
          </button>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm; 