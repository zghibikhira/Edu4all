import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import FollowButton from '../../components/FollowButton';
import PostsList from '../../components/PostsList';
import FollowersList from '../../components/FollowersList';
import TeacherRatingForm from '../../components/TeacherRatingForm';
import EvaluationList from '../../components/EvaluationList';

const EnhancedTeacherProfile = () => {
  const { teacherId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    fetchTeacherProfile();
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teachers/${teacherId}`);
      setTeacher(response.data.data);
      
      // Fetch additional stats
      const [followersResponse, postsResponse] = await Promise.all([
        api.get(`/follows/teachers/${teacherId}/follow-stats`),
        api.get(`/posts/teachers/${teacherId}/post-stats`)
      ]);
      
      setFollowersCount(followersResponse.data.data.followersCount);
      setPostsCount(postsResponse.data.data.totalPosts);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = (isFollowing) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : Math.max(0, prev - 1));
  };

  const handlePostCreated = (newPost) => {
    setPostsCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-700">{error || 'Enseignant non trouvé'}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.id === teacherId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={teacher.avatar || '/default-avatar.png'}
                alt={`${teacher.firstName} ${teacher.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                {teacher.firstName} {teacher.lastName}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {teacher.teacherInfo?.subjects?.join(', ')}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-700">
                    {teacher.teacherInfo?.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-700">
                  {teacher.teacherInfo?.totalReviews || 0} avis
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-700">
                  {followersCount} follower{followersCount !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-700">
                  {postsCount} post{postsCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && user && user.role === 'etudiant' && (
              <div className="flex-shrink-0">
                <FollowButton
                  teacherId={teacherId}
                  initialFollowersCount={followersCount}
                  onFollowChange={handleFollowChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'about', label: 'À propos' },
              { id: 'courses', label: 'Cours' },
              { id: 'posts', label: 'Posts' },
              { id: 'reviews', label: 'Avis' },
              { id: 'followers', label: 'Followers' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">À propos</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Expérience</h3>
                    <p className="text-gray-600">
                      {teacher.teacherInfo?.experience || 0} ans d'expérience
                    </p>
                  </div>
                  
                  {teacher.teacherInfo?.education && (
                    <div>
                      <h3 className="font-medium text-gray-900">Formation</h3>
                      <p className="text-gray-600">
                        {teacher.teacherInfo.education.degree} - {teacher.teacherInfo.education.institution}
                        {teacher.teacherInfo.education.year && ` (${teacher.teacherInfo.education.year})`}
                      </p>
                    </div>
                  )}

                  {teacher.teacherInfo?.subjects && teacher.teacherInfo.subjects.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900">Matières enseignées</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.teacherInfo.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {teacher.bio && (
                    <div>
                      <h3 className="font-medium text-gray-900">Bio</h3>
                      <p className="text-gray-600">{teacher.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Cours</h2>
                <p className="text-gray-500">Liste des cours de cet enseignant</p>
                {/* Add course list component here */}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-white rounded-lg shadow p-6">
                <PostsList
                  teacherId={teacherId}
                  showCreateForm={isOwnProfile}
                  onPostCreated={handlePostCreated}
                />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Avis et évaluations</h2>
                {user && user.role === 'etudiant' && !isOwnProfile && (
                  <div className="mb-6">
                    <TeacherRatingForm teacherId={teacherId} />
                  </div>
                )}
                <EvaluationList teacherId={teacherId} />
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="bg-white rounded-lg shadow p-6">
                <FollowersList teacherId={teacherId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Note moyenne</span>
                  <span className="font-medium">
                    {teacher.teacherInfo?.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre d'avis</span>
                  <span className="font-medium">
                    {teacher.teacherInfo?.totalReviews || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-medium">{followersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-medium">{postsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expérience</span>
                  <span className="font-medium">
                    {teacher.teacherInfo?.experience || 0} ans
                  </span>
                </div>
              </div>

              {teacher.teacherInfo?.availability && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Disponibilité</h4>
                  <p className="text-gray-600">
                    {teacher.teacherInfo.availability.timezone}
                  </p>
                </div>
              )}

              {!isOwnProfile && user && (
                <div className="mt-6 pt-6 border-t">
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                    Contacter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTeacherProfile;
