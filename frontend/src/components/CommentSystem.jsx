import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaComment, FaReply, FaEdit, FaTrash, FaThumbsUp, FaThumbsDown, FaFlag, FaCheck, FaTimes } from 'react-icons/fa';

const CommentSystem = ({ entityType, entityId, onCommentUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId, page]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${entityType}/${entityId}?page=${page}&limit=10&includeReplies=true`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        if (page === 1) {
          setComments(data.data.comments);
        } else {
          setComments(prev => [...prev, ...data.data.comments]);
        }
        setHasMore(data.data.pagination.page < data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newComment,
          entityType,
          entityId,
          type: 'general'
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments(); // Refresh comments
        if (onCommentUpdate) onCommentUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
    }
  };

  const handleSubmitReply = async (parentCommentId, content) => {
    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          entityType,
          entityId,
          parentComment: parentCommentId,
          type: 'answer'
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowReplyForm(null);
        fetchComments(); // Refresh comments
        if (onCommentUpdate) onCommentUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réponse:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: editContent
        })
      });

      const data = await response.json();
      if (data.success) {
        setEditingComment(null);
        setEditContent('');
        fetchComments(); // Refresh comments
        if (onCommentUpdate) onCommentUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchComments(); // Refresh comments
        if (onCommentUpdate) onCommentUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleReaction = async (commentId, reactionType) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reactionType })
      });

      const data = await response.json();
      if (data.success) {
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error);
    }
  };

  const handleFlagComment = async (commentId, reason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: reason || 'Contenu inapproprié' })
      });

      const data = await response.json();
      if (data.success) {
        alert('Commentaire signalé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment, isReply = false) => {
    const isAuthor = user && comment.author._id === user._id;
    const isAdmin = user && user.role === 'admin';

    return (
      <div key={comment._id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm border">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {comment.author.firstName} {comment.author.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && (
                    <span className="ml-2 text-blue-600">(modifié)</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(showReplyForm === comment._id ? null : comment._id)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <FaReply />
                  Répondre
                </button>
              )}
              
              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment._id);
                      setEditContent(comment.content);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                  >
                    <FaEdit />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <FaTrash />
                    Supprimer
                  </button>
                </>
              )}
              
              {!isAuthor && (
                <button
                  onClick={() => handleFlagComment(comment._id)}
                  className="text-orange-600 hover:text-orange-800 text-sm flex items-center gap-1"
                >
                  <FaFlag />
                  Signaler
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {editingComment === comment._id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditComment(comment._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <FaCheck className="inline mr-1" />
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  <FaTimes className="inline mr-1" />
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 mb-3">
              {comment.content}
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => handleReaction(comment._id, 'like')}
              className={`flex items-center gap-1 ${
                comment.reactions?.likes?.includes(user?._id) 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <FaThumbsUp />
              {comment.reactions?.likes?.length || 0}
            </button>
            
            <button
              onClick={() => handleReaction(comment._id, 'dislike')}
              className={`flex items-center gap-1 ${
                comment.reactions?.dislikes?.includes(user?._id) 
                  ? 'text-red-600' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <FaThumbsDown />
              {comment.reactions?.dislikes?.length || 0}
            </button>
            
            <button
              onClick={() => handleReaction(comment._id, 'helpful')}
              className={`flex items-center gap-1 ${
                comment.reactions?.helpful?.includes(user?._id) 
                  ? 'text-green-600' 
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <FaCheck />
              {comment.reactions?.helpful?.length || 0}
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm === comment._id && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <textarea
                placeholder="Écrire une réponse..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2"
                maxLength={1000}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const content = document.querySelector(`textarea[placeholder="Écrire une réponse..."]`).value;
                    if (content.trim()) {
                      handleSubmitReply(comment._id, content);
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Répondre
                </button>
                <button
                  onClick={() => setShowReplyForm(null)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des commentaires...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FaComment className="inline mr-2 text-blue-600" />
            Ajouter un commentaire
          </h3>
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez vos pensées..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
              maxLength={2000}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {newComment.length}/2000 caractères
              </div>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Publier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaComment className="text-4xl mx-auto mb-2 text-gray-300" />
            <p>Aucun commentaire pour le moment</p>
            {!user && (
              <p className="text-sm mt-1">Connectez-vous pour laisser un commentaire</p>
            )}
          </div>
        ) : (
          <>
            {comments.map(comment => renderComment(comment))}
            
            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Charger plus de commentaires
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSystem;
