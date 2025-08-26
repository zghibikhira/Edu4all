import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { postAPI } from '../utils/api';
import { FaEdit, FaEye, FaEyeSlash, FaTag, FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa';

const PostForm = ({ onPostCreated, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    text: '',
    visibility: 'public',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 1000;

  const handleTextChange = (e) => {
    const text = e.target.value;
    setFormData(prev => ({ ...prev, text }));
    setCharCount(text.length);
  };

  const handleVisibilityChange = (visibility) => {
    setFormData(prev => ({ ...prev, visibility }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      alert('Veuillez saisir le contenu de votre post');
      return;
    }

    if (formData.text.length > maxChars) {
      alert(`Le texte ne peut pas dépasser ${maxChars} caractères`);
      return;
    }

    setLoading(true);
    try {
      const response = await postAPI.createPost({
        text: formData.text.trim(),
        visibility: formData.visibility,
        tags: formData.tags
      });

      if (response.data.success) {
      if (onPostCreated) {
        onPostCreated(response.data.data);
        }
        if (onClose) {
          onClose();
        }
        // Reset form
        setFormData({
          text: '',
          visibility: 'public',
          tags: []
        });
        setCharCount(0);
      } else {
        alert(response.data.message || 'Erreur lors de la création du post');
      }
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      alert('Erreur lors de la création du post. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'enseignant') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Seuls les enseignants peuvent créer des posts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <FaEdit className="mr-2 text-blue-600" />
          Créer un nouveau post
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu du post
          </label>
          <textarea
            value={formData.text}
            onChange={handleTextChange}
            placeholder="Partagez quelque chose avec vos étudiants..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={6}
            maxLength={maxChars}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${
              charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {charCount}/{maxChars} caractères
            </span>
          </div>
        </div>

        {/* Visibility Settings */}
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibilité
            </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'public', label: 'Public', icon: FaEye, description: 'Visible par tous' },
              { value: 'followers', label: 'Followers', icon: FaEye, description: 'Visible par vos followers' },
              { value: 'private', label: 'Privé', icon: FaEyeSlash, description: 'Visible par vous seul' }
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleVisibilityChange(option.value)}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.visibility === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Icon className="mx-auto mb-2 text-lg" />
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </button>
              );
            })}
          </div>
          </div>

        {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optionnel)
            </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || formData.tags.length >= 5}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaTag className="text-sm" />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              ))}
          </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Maximum 5 tags, 20 caractères par tag
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !formData.text.trim() || charCount > maxChars}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publication...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Publier
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
