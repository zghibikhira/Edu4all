import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const FollowersList = ({ teacherId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFollowers = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await api.get(`/follows/teachers/${teacherId}/followers`, {
        params: {
          page: pageNum,
          limit: 20
        }
      });

      const newFollowers = response.data.data.followers;
      
      if (append) {
        setFollowers(prev => [...prev, ...newFollowers]);
      } else {
        setFollowers(newFollowers);
      }

      setHasMore(response.data.data.pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setError('Erreur lors du chargement des followers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [teacherId]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFollowers(page + 1, true);
    }
  };

  if (loading && followers.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchFollowers(1, false)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Followers ({followers.length})
      </h2>

      {followers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun follower pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followers.map(follow => (
            <div key={follow._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={follow.followerId.avatar || '/default-avatar.png'}
                alt={`${follow.followerId.firstName} ${follow.followerId.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {follow.followerId.firstName} {follow.followerId.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  Suit depuis le {new Date(follow.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && followers.length > 0 && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Chargement...' : 'Charger plus'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowersList;
