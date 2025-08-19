import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const FollowButton = ({ teacherId, initialFollowersCount = 0, onFollowChange }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user && user.role === 'etudiant') {
      checkFollowStatus();
    } else {
      setIsChecking(false);
    }
  }, [user, teacherId]);

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/follows/teachers/${teacherId}/follow-status`);
      setIsFollowing(response.data.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || user.role !== 'etudiant') {
      alert('Vous devez être connecté en tant qu\'étudiant pour suivre des enseignants');
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await api.delete(`/follows/teachers/${teacherId}/follow`);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        if (onFollowChange) onFollowChange(false);
      } else {
        // Follow
        await api.post(`/follows/teachers/${teacherId}/follow`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        if (onFollowChange) onFollowChange(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.message || 'Erreur lors du suivi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button 
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
        disabled
      >
        Chargement...
      </button>
    );
  }

  if (!user || user.role !== 'etudiant') {
    return (
      <div className="text-center">
        <button 
          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
          disabled
        >
          Connectez-vous pour suivre
        </button>
        <p className="text-sm text-gray-500 mt-1">
          {followersCount} follower{followersCount !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isFollowing
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isFollowing ? 'Ne plus suivre...' : 'Suivre...'}
          </span>
        ) : (
          isFollowing ? 'Ne plus suivre' : 'Suivre'
        )}
      </button>
      <p className="text-sm text-gray-600 mt-1">
        {followersCount} follower{followersCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default FollowButton;
