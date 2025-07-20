import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EvaluationForm from '../components/EvaluationForm';

const CreateEvaluation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'enseignant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès restreint</h2>
          <p className="text-gray-600">Seuls les enseignants peuvent créer des évaluations.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (formData) => {
    try {
      // In real app, make API call to create evaluation
      console.log('Creating evaluation:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Évaluation créée avec succès !');
      navigate('/evaluations');
    } catch (error) {
      console.error('Error creating evaluation:', error);
      alert('Erreur lors de la création de l\'évaluation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EvaluationForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateEvaluation; 