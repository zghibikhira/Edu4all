import React, { useState, useEffect } from 'react';
import { 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaBookmark, 
  FaEllipsisH,
  FaUserPlus,
  FaUserCheck,
  FaImage,
  FaVideo,
  FaFile,
  FaSmile,
  FaPaperPlane,
  FaTrash,
  FaEdit,
  FaFlag,
  FaThumbsUp,
  FaReply,
  FaClock,
  FaEye,
  FaUsers,
  FaAward
} from 'react-icons/fa';

const FollowersPosts = () => {
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data pour les posts et followers
      const mockPosts = [
        {
          _id: '1',
          teacher: {
            _id: '1',
            firstName: 'Marie',
            lastName: 'Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
            subjects: ['Mathématiques', 'Physique'],
            isVerified: true
          },
          content: 'Nouveau cours disponible : Trigonométrie pour le lycée. Ce cours couvre tous les concepts essentiels avec des exercices pratiques et des vidéos explicatives. Inscrivez-vous vite ! 📚✨',
          media: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150'
          },
          likes: 45,
          comments: [
            {
              _id: '1',
              user: {
                firstName: 'Thomas',
                lastName: 'Martin',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
              },
              content: 'Super cours ! J\'ai déjà réservé ma place 😊',
              timestamp: '2024-01-15T10:30:00Z',
              likes: 3
            },
            {
              _id: '2',
              user: {
                firstName: 'Sophie',
                lastName: 'Bernard',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
              },
              content: 'Parfait pour réviser le bac !',
              timestamp: '2024-01-15T11:15:00Z',
              likes: 1
            }
          ],
          shares: 12,
          timestamp: '2024-01-15T09:00:00Z',
          isLiked: false,
          isBookmarked: false,
          tags: ['#mathématiques', '#trigonométrie', '#lycée']
        },
        {
          _id: '2',
          teacher: {
            _id: '2',
            firstName: 'Jean',
            lastName: 'Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            subjects: ['Histoire', 'Géographie'],
            isVerified: true
          },
          content: 'Conseils pour réussir vos dissertations d\'histoire : 1) Bien analyser le sujet 2) Construire un plan logique 3) Utiliser des exemples précis 4) Soigner la conclusion. Qui a des questions ? 🤔',
          media: null,
          likes: 67,
          comments: [
            {
              _id: '3',
              user: {
                firstName: 'Emma',
                lastName: 'Leroy',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
              },
              content: 'Merci pour ces conseils ! J\'ai toujours du mal avec la conclusion...',
              timestamp: '2024-01-15T08:45:00Z',
              likes: 5
            }
          ],
          shares: 23,
          timestamp: '2024-01-15T07:30:00Z',
          isLiked: true,
          isBookmarked: true,
          tags: ['#histoire', '#dissertation', '#conseils']
        },
        {
          _id: '3',
          teacher: {
            _id: '3',
            firstName: 'Sophie',
            lastName: 'Bernard',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
            subjects: ['Anglais', 'Espagnol'],
            isVerified: true
          },
          content: 'Nouvelle vidéo disponible : "Améliorer votre prononciation en anglais". Techniques pratiques et exercices pour parler comme un natif ! 🎥🇬🇧',
          media: {
            type: 'video',
            url: 'https://example.com/video.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
            duration: '12:34'
          },
          likes: 89,
          comments: [],
          shares: 34,
          timestamp: '2024-01-14T16:00:00Z',
          isLiked: false,
          isBookmarked: false,
          tags: ['#anglais', '#prononciation', '#vidéo']
        }
      ];

      const mockFollowers = [
        {
          _id: '1',
          firstName: 'Thomas',
          lastName: 'Martin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          level: 'Lycée',
          subjects: ['Mathématiques', 'Physique'],
          isFollowing: true,
          lastActive: '2024-01-15T12:00:00Z'
        },
        {
          _id: '2',
          firstName: 'Emma',
          lastName: 'Leroy',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          level: 'Collège',
          subjects: ['Histoire', 'Français'],
          isFollowing: true,
          lastActive: '2024-01-15T11:30:00Z'
        },
        {
          _id: '3',
          firstName: 'Lucas',
          lastName: 'Dubois',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          level: 'Supérieur',
          subjects: ['Informatique', 'Mathématiques'],
          isFollowing: false,
          lastActive: '2024-01-15T10:15:00Z'
        }
      ];

      setPosts(mockPosts);
      setFollowers(mockFollowers);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  const handleFollow = (followerId) => {
    setFollowers(prev => prev.map(follower => {
      if (follower._id === followerId) {
        return {
          ...follower,
          isFollowing: !follower.isFollowing
        };
      }
      return follower;
    }));
  };

  const handleComment = (postId, comment) => {
    const newComment = {
      _id: Date.now().toString(),
      user: {
        firstName: 'Vous',
        lastName: '',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      content: comment,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleShare = (postId) => {
    // Simuler le partage
    alert('Post partagé !');
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `il y a ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `il y a ${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  const renderPost = (post) => (
    <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        <img 
          src={post.teacher.avatar} 
          alt={`${post.teacher.firstName} ${post.teacher.lastName}`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.teacher.firstName} {post.teacher.lastName}
            </h3>
            {post.teacher.isVerified && (
              <span className="text-blue-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {post.teacher.subjects.join(', ')} • {formatTimeAgo(post.timestamp)}
          </p>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <FaEllipsisH />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 dark:text-white mb-3">{post.content}</p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-blue-600 dark:text-blue-400 text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {post.media && (
          <div className="relative rounded-lg overflow-hidden mb-4">
            {post.media.type === 'image' && (
              <img 
                src={post.media.url} 
                alt="Post media"
                className="w-full h-64 object-cover"
              />
            )}
            {post.media.type === 'video' && (
              <div className="relative">
                <img 
                  src={post.media.thumbnail} 
                  alt="Video thumbnail"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {post.media.duration}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleLike(post._id)}
            className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <FaHeart className={post.isLiked ? 'fill-current' : ''} />
            <span>{post.likes}</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
            <FaComment />
            <span>{post.comments.length}</span>
          </button>
          
          <button
            onClick={() => handleShare(post._id)}
            className="flex items-center gap-2 text-gray-500 hover:text-green-500"
          >
            <FaShare />
            <span>{post.shares}</span>
          </button>
        </div>
        
        <button
          onClick={() => handleBookmark(post._id)}
          className={`${post.isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
        >
          <FaBookmark className={post.isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Commentaires ({post.comments.length})
          </h4>
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <img 
                  src={comment.user.avatar} 
                  alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500">
                      <FaThumbsUp />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-xs text-gray-500 hover:text-blue-500">
                      <FaReply />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Comment */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex gap-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleComment(post._id, e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button className="px-3 py-2 text-blue-600 hover:text-blue-700">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFollowers = () => (
    <div className="space-y-4">
      {followers.map((follower) => (
        <div key={follower._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <img 
              src={follower.avatar} 
              alt={`${follower.firstName} ${follower.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {follower.firstName} {follower.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {follower.level} • {follower.subjects.join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                Dernière activité: {formatTimeAgo(follower.lastActive)}
              </p>
            </div>
            <button
              onClick={() => handleFollow(follower._id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                follower.isFollowing
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {follower.isFollowing ? (
                <>
                  <FaUserCheck className="inline mr-1" />
                  Suivi
                </>
              ) : (
                <>
                  <FaUserPlus className="inline mr-1" />
                  Suivre
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Posts & Followers
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'followers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Followers ({followers.length})
          </button>
        </div>
      </div>

      {/* New Post Form */}
      {activeTab === 'posts' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex gap-3">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
              alt="Your avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Partagez quelque chose avec vos followers..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaImage />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaVideo />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaFile />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaSmile />
                  </button>
                </div>
                <button
                  disabled={!newPost.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {posts.map(renderPost)}
        </div>
      ) : (
        renderFollowers()
      )}
    </div>
  );
};

export default FollowersPosts;
