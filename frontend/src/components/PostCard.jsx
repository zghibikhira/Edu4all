import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import CommentSystem from './CommentSystem';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.engagement?.likes?.includes(user?.id) || false);
  const [likesCount, setLikesCount] = useState(post.engagement?.likes?.length || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Vous devez être connecté pour liker un post');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/posts/${post._id}/like`);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Erreur lors du like');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      alert('Vous devez être connecté pour partager un post');
      return;
    }

    try {
      await api.post(`/posts/${post._id}/share`);
      alert('Post partagé avec succès!');
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Erreur lors du partage');
    }
  };

  const handleReport = async () => {
    const reason = prompt('Raison du signalement:');
    if (!reason) return;

    try {
      await api.post(`/posts/${post._id}/report`, { reason });
      alert('Post signalé avec succès');
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Erreur lors du signalement');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      return;
    }

    try {
      await api.delete(`/posts/${post._id}`);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const canEdit = user && (user.id === post.teacherId._id || user.role === 'admin');
  const canDelete = user && (user.id === post.teacherId._id || user.role === 'admin');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.teacherId.avatar || '/default-avatar.png'}
            alt={`${post.teacherId.firstName} ${post.teacherId.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">
              {post.teacherId.firstName} {post.teacherId.lastName}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(post.createdAt)}
              {post.isEdited && ' (modifié)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post.visibility === 'private' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Privé
            </span>
          )}
          {post.visibility === 'followers' && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Followers
            </span>
          )}
          
          <div className="relative">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden">
              {canEdit && (
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Modifier
                </button>
              )}
              {canDelete && (
                <button 
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Supprimer
                </button>
              )}
              <button 
                onClick={handleReport}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.text}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{post.engagement.viewsCount || 0} vues</span>
          <span>{post.engagement.commentsCount || 0} commentaires</span>
        </div>
      </div>

      {/* Engagement Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Commenter</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Partager</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 border-t pt-4">
          <CommentSystem
            entityType="post"
            entityId={post._id}
            onCommentAdded={() => {
              // Update comment count
              if (onPostUpdated) {
                onPostUpdated({ ...post, engagement: { ...post.engagement, commentsCount: (post.engagement.commentsCount || 0) + 1 } });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
