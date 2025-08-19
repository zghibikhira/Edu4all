import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Feed from '../components/Feed';

const FeedPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600">Connectez-vous pour voir votre feed</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'etudiant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="text-gray-700">Cette page est réservée aux étudiants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Feed />
      </div>
    </div>
  );
};

export default FeedPage;
