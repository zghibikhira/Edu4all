import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaDownload, FaEye, FaFilePdf, FaVideo, FaCalendar, FaEuroSign, FaCheckCircle, FaClock } from 'react-icons/fa';

const PurchaseHistory = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/purchases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPurchases(data.data?.purchases || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" title="Terminé" />;
      case 'pending':
        return <FaClock className="text-yellow-500" title="En attente" />;
      case 'failed':
        return <FaClock className="text-red-500" title="Échoué" />;
      default:
        return <FaClock className="text-gray-500" title="Inconnu" />;
    }
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (fileType?.includes('video')) return <FaVideo className="text-blue-500" />;
    return <FaFilePdf className="text-gray-500" />;
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesFilter = filter === 'all' || purchase.status === filter;
    const matchesSearch = purchase.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.course?.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.purchasedAt) - new Date(a.purchasedAt);
      case 'title':
        return (a.course?.title || '').localeCompare(b.course?.title || '');
      case 'price':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const handleAccessCourse = (purchase) => {
    // Navigate to course details or open course content
    if (purchase.course?._id) {
      window.open(`/course/${purchase.course._id}`, '_blank');
    }
  };

  const handleDownloadFile = async (purchase, fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/download/${purchase.course._id}/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = purchase.purchasedFiles.find(f => f.fileId === fileId)?.originalName || 'file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à l'historique des achats.</p>
          <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'historique...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Historique des Achats</h1>
              <p className="mt-2 text-gray-600">
                Consultez tous vos cours achetés et accédez à leur contenu
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom du cours ou enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Terminés</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoués</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date d'achat</option>
                <option value="title">Nom du cours</option>
                <option value="price">Prix</option>
              </select>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <div className="text-2xl font-bold text-blue-600">
                {filteredPurchases.length} cours
              </div>
            </div>
          </div>
        </div>

        {/* Purchase List */}
        {sortedPurchases.length > 0 ? (
          <div className="space-y-4">
            {sortedPurchases.map((purchase) => (
              <div key={purchase._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Course Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-2xl">📚</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {purchase.course?.title || 'Cours non disponible'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <FaCalendar className="text-gray-400" />
                            <span>
                              Acheté le {new Date(purchase.purchasedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FaEuroSign className="text-gray-400" />
                            <span>{purchase.amount} {purchase.currency}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(purchase.status)}
                            <span className="capitalize">{purchase.status}</span>
                          </div>
                        </div>

                        {purchase.course?.instructor && (
                          <p className="text-sm text-gray-500 mt-2">
                            Enseignant: {purchase.course.instructor}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleAccessCourse(purchase)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaEye className="mr-2" />
                      Accéder au cours
                    </button>
                    
                    {purchase.purchasedFiles && purchase.purchasedFiles.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-700">Fichiers disponibles:</span>
                        {purchase.purchasedFiles.map((file) => (
                          <button
                            key={file.fileId}
                            onClick={() => handleDownloadFile(purchase, file.fileId)}
                            className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                          >
                            {getFileTypeIcon(file.fileType)}
                            <span className="ml-2">{file.originalName}</span>
                            <FaDownload className="ml-2 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Description */}
                {purchase.course?.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-600">{purchase.course.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun cours acheté</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Aucun cours ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore acheté de cours.'
              }
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Découvrir des cours
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
