import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaCalculator, FaSave, FaEye } from 'react-icons/fa';

const EvaluationForm = ({ evaluation, onSubmit, onCancel, isTeacher = false }) => {
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (evaluation && evaluation.questions) {
      // Initialize answers and calculate max score
      const initialAnswers = {};
      const initialScores = {};
      let totalMaxScore = 0;

      evaluation.questions.forEach((question, index) => {
        initialAnswers[index] = '';
        initialScores[index] = 0;
        totalMaxScore += question.points || 1;
      });

      setAnswers(initialAnswers);
      setScores(initialScores);
      setMaxScore(totalMaxScore);
    }
  }, [evaluation]);

  useEffect(() => {
    // Calculate total score and percentage
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    setTotalScore(total);
    
    if (maxScore > 0) {
      const percent = (total / maxScore) * 100;
      setPercentage(percent);
      setGrade(calculateGrade(percent));
    }
  }, [scores, maxScore]);

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));

    // Auto-grade if it's a multiple choice question
    const question = evaluation.questions[questionIndex];
    if (question.type === 'multiple_choice' && question.correctAnswer) {
      const isCorrect = answer === question.correctAnswer;
      const score = isCorrect ? (question.points || 1) : 0;
      
      setScores(prev => ({
        ...prev,
        [questionIndex]: score
      }));
    }
  };

  const handleManualGrading = (questionIndex, score) => {
    const question = evaluation.questions[questionIndex];
    const maxPoints = question.points || 1;
    const clampedScore = Math.max(0, Math.min(score, maxPoints));
    
    setScores(prev => ({
      ...prev,
      [questionIndex]: clampedScore
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const evaluationData = {
        evaluationId: evaluation._id,
        answers,
        scores,
        totalScore,
        maxScore,
        percentage,
        grade,
        submittedAt: new Date()
      };

      await onSubmit(evaluationData);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, index) => {
    const questionScore = scores[index] || 0;
    const maxPoints = question.points || 1;

  return (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Question {index + 1}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {question.text}
            </p>
          </div>
          <div className="text-right ml-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {maxPoints} point{maxPoints > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Question Content */}
          <div className="mb-4">
          {question.type === 'multiple_choice' && (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  {question.correctAnswer && answers[index] === option && (
                    <span className="ml-auto">
                      {option === question.correctAnswer ? (
                        <FaCheck className="text-green-500 w-4 h-4" />
                      ) : (
                        <FaTimes className="text-red-500 w-4 h-4" />
                      )}
                    </span>
                  )}
                </label>
              ))}
          </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              rows={4}
              placeholder="Votre réponse..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {question.type === 'number' && (
            <input
              type="number"
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Votre réponse..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Grading Section (for teachers) */}
        {isTeacher && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Note manuelle:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  step="0.5"
                  value={questionScore}
                  onChange={(e) => handleManualGrading(index, parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / {maxPoints}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Score Display */}
        {questionScore > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Score obtenu:
              </span>
              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                {questionScore}/{maxPoints}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!evaluation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Aucune évaluation trouvée</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Résultats de l'évaluation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {evaluation.title}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalScore}/{maxScore}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Score total
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Pourcentage
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {grade}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Note
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowResults(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEye className="inline mr-2" />
            Voir les détails
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {evaluation.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {evaluation.description}
        </p>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Questions:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {evaluation.questions?.length || 0}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Score max:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {maxScore} points
              </span>
            </div>
          </div>
          
          {!isTeacher && (
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {totalScore}/{maxScore}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {percentage.toFixed(1)}% - {grade}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {evaluation.questions?.map((question, index) => renderQuestion(question, index))}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Annuler
          </button>
          
          <div className="flex items-center gap-4">
            {!isTeacher && (
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Score: {totalScore}/{maxScore}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {percentage.toFixed(1)}% - {grade}
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <FaSave />
                  {isTeacher ? 'Sauvegarder' : 'Soumettre'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm; 