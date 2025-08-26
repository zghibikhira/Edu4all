import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { followAPI } from '../utils/api';
import { FaUsers, FaUserPlus, FaUserCheck, FaUserGraduate } from 'react-icons/fa';

const FollowersList = ({ teacherId, type = 'followers' }) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(type);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else {
      fetchFollowing();
    }
  }, [teacherId, activeTab, page]);

  const fetchFollowers = async () => {
    try {
      const response = await followAPI.getTeacherFollowers(teacherId, {
        page,
        limit: 20
      });
      
      if (response.data.success) {
        if (page === 1) {
          setFollowers(response.data.data.followers || []);
        } else {
          setFollowers(prev => [...prev, ...(response.data.data.followers || [])]);
        }
        setHasMore(response.data.data.pagination?.hasNext || false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await followAPI.getFollowingTeachers({
        page,
        limit: 20
      });
      
      if (response.data.success) {
        if (page === 1) {
          setFollowing(response.data.data.following || []);
        } else {
          setFollowing(prev => [...prev, ...(response.data.data.following || [])]);
        }
        setHasMore(response.data.data.pagination?.hasNext || false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setHasMore(true);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderUserCard = (user, isFollowing = false) => (
    <div key={user._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-lg">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.role === 'etudiant' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              <FaUserGraduate className="mr-1" />
              Étudiant
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isFollowing && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaUserCheck className="mr-1" />
            Suivi
          </span>
        )}
        <Link
          to={`/teacher/${user._id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Voir profil
        </Link>
      </div>
    </div>
  );

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaUsers className="mr-3 text-blue-600" />
          {activeTab === 'followers' ? 'Followers' : 'Following'}
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('followers')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'followers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'followers' ? (
          <>
            {followers.length > 0 ? (
              <div className="space-y-3">
                {followers.map((follower) => renderUserCard(follower))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun follower pour le moment
                </h3>
                <p className="text-gray-500">
                  Les étudiants qui vous suivent apparaîtront ici
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {following.length > 0 ? (
              <div className="space-y-3">
                {following.map((teacher) => renderUserCard(teacher, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaUserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vous ne suivez personne pour le moment
                </h3>
                <p className="text-gray-500">
                  Commencez à suivre des enseignants pour voir leurs posts
                </p>
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : 'Charger plus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersList;
