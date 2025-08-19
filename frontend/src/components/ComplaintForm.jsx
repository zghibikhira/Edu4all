import React, { useState } from 'react';
import { FaExclamationTriangle, FaUpload, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { complaintAPI } from '../utils/api';

const ComplaintForm = ({ isOpen, onClose, onSuccess, againstUserId = null, orderId = null, sessionId = null, courseId = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    againstUserId,
    orderId,
    sessionId,
    courseId
  });
  
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Comportement inapproprié' },
    { value: 'HARASSMENT', label: 'Harcèlement' },
    { value: 'FRAUD', label: 'Fraude' },
    { value: 'COPYRIGHT_VIOLATION', label: 'Violation de droits d\'auteur' },
    { value: 'TECHNICAL_ISSUE', label: 'Problème technique' },
    { value: 'PAYMENT_ISSUE', label: 'Problème de paiement' },
    { value: 'QUALITY_ISSUE', label: 'Problème de qualité' },
    { value: 'SPAM', label: 'Spam' },
    { value: 'OTHER', label: 'Autre' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const complaintData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          complaintData.append(key, formData[key]);
        }
      });

      // Add files
      evidenceFiles.forEach(file => {
        complaintData.append('evidenceFiles', file);
      });

      await complaintAPI.createComplaint(complaintData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        againstUserId,
        orderId,
        sessionId,
        courseId
      });
      setEvidenceFiles([]);
      
      onSuccess && onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError(error.response?.data?.message || 'Erreur lors de la soumission de la plainte');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h2 className="text-xl font-semibold text-gray-900">
              Signaler un problème
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la plainte *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Résumé bref du problème"
              maxLength={200}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez le problème en détail..."
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 caractères
            </p>
          </div>

          {/* Evidence Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preuves (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                onChange={handleFileChange}
                className="hidden"
                id="evidence-files"
              />
              <label
                htmlFor="evidence-files"
                className="flex flex-col items-center space-y-2 cursor-pointer"
              >
                <FaUpload className="text-gray-400 text-2xl" />
                <span className="text-sm text-gray-600">
                  Cliquez pour ajouter des fichiers
                </span>
                <span className="text-xs text-gray-500">
                  PDF, images, vidéos (max 5 fichiers, 10MB chacun)
                </span>
              </label>
            </div>

            {/* File List */}
            {evidenceFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <FaUpload className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="text-sm" />
              <span>{isSubmitting ? 'Envoi...' : 'Soumettre la plainte'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
