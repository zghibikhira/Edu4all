import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaEye, FaClock, FaCheck, FaTimes, FaArrowUp, FaFilter, FaSearch, FaEdit, FaBan, FaChartBar } from 'react-icons/fa';
import { complaintAPI, moderationAPI } from '../../utils/api';
import ComplaintForm from '../../components/ComplaintForm';

const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [stats, setStats] = useState(null);

  const statusColors = {
    'NEW': 'bg-blue-100 text-blue-800',
    'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
    'RESOLVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'ESCALATED': 'bg-purple-100 text-purple-800'
  };

  const statusIcons = {
    'NEW': FaExclamationTriangle,
    'UNDER_REVIEW': FaClock,
    'RESOLVED': FaCheck,
    'REJECTED': FaTimes,
    'ESCALATED': FaArrowUp
  };

  const statusLabels = {
    'NEW': 'Nouvelle',
    'UNDER_REVIEW': 'En cours d\'examen',
    'RESOLVED': 'Résolue',
    'REJECTED': 'Rejetée',
    'ESCALATED': 'Escaladée'
  };

  const categoryLabels = {
    'INAPPROPRIATE_BEHAVIOR': 'Comportement inapproprié',
    'HARASSMENT': 'Harcèlement',
    'FRAUD': 'Fraude',
    'COPYRIGHT_VIOLATION': 'Violation de droits d\'auteur',
    'TECHNICAL_ISSUE': 'Problème technique',
    'PAYMENT_ISSUE': 'Problème de paiement',
    'QUALITY_ISSUE': 'Problème de qualité',
    'SPAM': 'Spam',
    'OTHER': 'Autre'
  };

  const priorityLabels = {
    'LOW': 'Faible',
    'MEDIUM': 'Moyenne',
    'HIGH': 'Élevée',
    'URGENT': 'Urgente'
  };

  const fetchComplaints = async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const params = {
        page: pageNum,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await complaintAPI.getAdminComplaints(params);
      const newComplaints = response.data.data.complaints;
      const pagination = response.data.data.pagination;

      if (append) {
        setComplaints(prev => [...prev, ...newComplaints]);
      } else {
        setComplaints(newComplaints);
      }

      setHasMore(pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Erreur lors du chargement des plaintes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await complaintAPI.getComplaintStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchComplaints(1, false);
    fetchStats();
  }, [filters]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchComplaints(page + 1, true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpdateComplaint = async (complaintId, updateData) => {
    try {
      await complaintAPI.updateComplaint(complaintId, updateData);
      fetchComplaints(1, false);
      setShowUpdateModal(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Erreur lors de la mise à jour de la plainte');
    }
  };

  const handleEscalateComplaint = async (complaintId, escalatedTo) => {
    try {
      await complaintAPI.escalateComplaint(complaintId, escalatedTo);
      fetchComplaints(1, false);
      setShowUpdateModal(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error escalating complaint:', error);
      setError('Erreur lors de l\'escalade de la plainte');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const Icon = statusIcons[status];
    return Icon ? <Icon className="text-sm" /> : null;
  };

  if (isLoading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des plaintes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des plaintes
              </h1>
              <p className="text-gray-600">
                Gérez et modérez les plaintes des utilisateurs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchStats()}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaChartBar className="text-sm" />
                <span>Actualiser les stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.status).map(([status, count]) => (
              <div key={status} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {statusLabels[status]}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-2 rounded-full ${statusColors[status]}`}>
                    {getStatusIcon(status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les priorités</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', category: '', priority: '' })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {complaint.title}
                      </h3>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>
                        {getStatusIcon(complaint.status)}
                        <span>{statusLabels[complaint.status]}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        complaint.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {priorityLabels[complaint.priority]}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>Catégorie: {categoryLabels[complaint.category]}</span>
                      <span>Par: {complaint.reporterId.firstName} {complaint.reporterId.lastName}</span>
                      <span>Créée le: {formatDate(complaint.createdAt)}</span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {complaint.description}
                    </p>

                    {complaint.againstUserId && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">
                          Contre: {complaint.againstUserId.firstName} {complaint.againstUserId.lastName}
                        </span>
                      </div>
                    )}

                    {complaint.evidenceFiles && complaint.evidenceFiles.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">
                          Preuves: {complaint.evidenceFiles.length} fichier(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEye className="text-sm" />
                      <span>Voir</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowUpdateModal(true);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                    >
                      <FaEdit className="text-sm" />
                      <span>Modifier</span>
                    </button>
                    {complaint.againstUserId && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowModerationModal(true);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaBan className="text-sm" />
                        <span>Modérer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </div>

        {/* Complaint Details Modal */}
        {selectedComplaint && !showUpdateModal && !showModerationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Détails de la plainte
                  </h2>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedComplaint.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>Statut: {statusLabels[selectedComplaint.status]}</span>
                      <span>Catégorie: {categoryLabels[selectedComplaint.category]}</span>
                      <span>Priorité: {priorityLabels[selectedComplaint.priority]}</span>
                    </div>
                    <p className="text-gray-700">{selectedComplaint.description}</p>
                  </div>

                  {/* Evidence Files */}
                  {selectedComplaint.evidenceFiles && selectedComplaint.evidenceFiles.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Preuves</h4>
                      <div className="space-y-2">
                        {selectedComplaint.evidenceFiles.map((file, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                            <FaUpload className="text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{file.originalName}</p>
                              <p className="text-xs text-gray-500">
                                {file.fileType} • {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const resp = await complaintAPI.getEvidenceUrl(selectedComplaint._id, index);
                                  const url = resp.data?.data?.url;
                                  if (url) {
                                    window.open(url, '_blank');
                                  }
                                } catch (e) {
                                  console.error('Erreur lors de l\'ouverture de la preuve', e);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Voir
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedComplaint.adminNotes && selectedComplaint.adminNotes.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Notes de l'administrateur</h4>
                      <div className="space-y-3">
                        {selectedComplaint.adminNotes.map((note, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-blue-800">
                                {note.adminId.firstName} {note.adminId.lastName}
                              </span>
                              <span className="text-xs text-blue-600">
                                {formatDate(note.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">{note.note}</p>
                            {note.isInternal && (
                              <span className="text-xs text-red-600">Note interne</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution */}
                  {selectedComplaint.resolution && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Résolution</h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700">{selectedComplaint.resolution}</p>
                        {selectedComplaint.resolvedBy && (
                          <p className="text-xs text-green-600 mt-2">
                            Résolu par: {selectedComplaint.resolvedBy.firstName} {selectedComplaint.resolvedBy.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Complaint Modal */}
        {showUpdateModal && selectedComplaint && (
          <UpdateComplaintModal
            complaint={selectedComplaint}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedComplaint(null);
            }}
            onUpdate={handleUpdateComplaint}
            onEscalate={handleEscalateComplaint}
          />
        )}

        {/* Moderation Modal */}
        {showModerationModal && selectedComplaint && (
          <ModerationModal
            complaint={selectedComplaint}
            onClose={() => {
              setShowModerationModal(false);
              setSelectedComplaint(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Update Complaint Modal Component
const UpdateComplaintModal = ({ complaint, onClose, onUpdate, onEscalate }) => {
  const [formData, setFormData] = useState({
    status: complaint.status,
    priority: complaint.priority,
    resolution: complaint.resolution || '',
    note: '',
    isInternal: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(complaint._id, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async (escalatedTo) => {
    setIsSubmitting(true);
    try {
      await onEscalate(complaint._id, escalatedTo);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mettre à jour la plainte
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NEW">Nouvelle</option>
                  <option value="UNDER_REVIEW">En cours d'examen</option>
                  <option value="RESOLVED">Résolue</option>
                  <option value="REJECTED">Rejetée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Faible</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Élevée</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résolution (optionnel)
              </label>
              <textarea
                value={formData.resolution}
                onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez la résolution..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (optionnel)
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajoutez une note..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isInternal"
                checked={formData.isInternal}
                onChange={(e) => setFormData(prev => ({ ...prev, isInternal: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isInternal" className="ml-2 text-sm text-gray-700">
                Note interne (non visible par l'utilisateur)
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleEscalate('LEGAL')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 disabled:opacity-50"
                >
                  Escalader vers Légal
                </button>
                <button
                  type="button"
                  onClick={() => handleEscalate('TECHNICAL')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50"
                >
                  Escalader vers Technique
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Moderation Modal Component
const ModerationModal = ({ complaint, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'WARN',
    reason: '',
    duration: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await moderationAPI.createModerationAction({
        ...formData,
        targetUserId: complaint.againstUserId._id,
        complaintId: complaint._id
      });
      onClose();
    } catch (error) {
      console.error('Error creating moderation action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Action de modération
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'action
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WARN">Avertissement</option>
                <option value="SUSPEND">Suspension</option>
                <option value="BAN">Bannissement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez la raison de cette action..."
                required
              />
            </div>

            {(formData.type === 'SUSPEND') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (heures, 0 = permanent)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi...' : 'Appliquer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsManagement;
