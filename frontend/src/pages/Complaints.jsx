import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaEye, FaClock, FaCheck, FaTimes, FaArrowUp, FaFilter, FaUpload } from 'react-icons/fa';
import { complaintAPI } from '../utils/api';
import ComplaintForm from '../components/ComplaintForm';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

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

  const fetchComplaints = async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const params = {
        page: pageNum,
        limit: 10
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await complaintAPI.getUserComplaints(params);
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

  useEffect(() => {
    fetchComplaints(1, false);
  }, [statusFilter]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchComplaints(page + 1, true);
    }
  };

  const handleComplaintSuccess = () => {
    fetchComplaints(1, false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mes plaintes
              </h1>
              <p className="text-gray-600">
                Gérez vos signalements et suivez leur progression
              </p>
            </div>
            <button
              onClick={() => setShowComplaintForm(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaExclamationTriangle className="text-sm" />
              <span>Nouvelle plainte</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune plainte
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore soumis de plaintes.
            </p>
            <button
              onClick={() => setShowComplaintForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaExclamationTriangle className="text-sm" />
              <span>Soumettre une plainte</span>
            </button>
          </div>
        ) : (
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
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>Catégorie: {categoryLabels[complaint.category]}</span>
                        <span>Priorité: {complaint.priority}</span>
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

                      {complaint.resolution && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <h4 className="text-sm font-medium text-green-800 mb-1">Résolution:</h4>
                          <p className="text-sm text-green-700">{complaint.resolution}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEye className="text-sm" />
                      <span>Voir détails</span>
                    </button>
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
        )}

        {/* Complaint Form Modal */}
        <ComplaintForm
          isOpen={showComplaintForm}
          onClose={() => setShowComplaintForm(false)}
          onSuccess={handleComplaintSuccess}
        />

        {/* Complaint Details Modal */}
        {selectedComplaint && (
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
                      <span>Priorité: {selectedComplaint.priority}</span>
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
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Voir
                            </a>
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
      </div>
    </div>
  );
};

export default Complaints;
