import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import FileUploadEnhanced from '../../components/FileUploadEnhanced';
import EvaluationList from '../../components/EvaluationList';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadResults, setUploadResults] = useState([]);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Veuillez vous connecter pour accéder au tableau de bord.</p>
          <Link to="/login" className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const handleFileUpload = (results) => {
    setUploadResults(results);
  };

  const stats = [
    {
      title: "Évaluations",
      value: user.role === 'enseignant' ? "12 créées" : "8 assignées",
      icon: "📊",
      color: "bg-blue-500",
      link: "/evaluations"
    },
    {
      title: "Cours",
      value: user.role === 'enseignant' ? "5 enseignés" : "3 suivis",
      icon: "📚",
      color: "bg-green-500",
      link: "/courses"
    },
    {
      title: "Fichiers",
      value: "24 uploadés",
      icon: "📁",
      color: "bg-purple-500",
      link: "#files"
    },
    {
      title: "Progression",
      value: user.role === 'etudiant' ? "78%" : "92%",
      icon: "📈",
      color: "bg-orange-500",
      link: "#progress"
    }
  ];

  const quickActions = [
    {
      title: "Créer une évaluation",
      description: "Assigner un nouveau devoir ou projet",
      icon: "📝",
      link: "/evaluations/create",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      showFor: ['enseignant']
    },
    {
      title: "Upload de fichiers",
      description: "Partager des documents ou vidéos",
      icon: "📤",
      link: "#files",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700",
      showFor: ['enseignant', 'etudiant']
    },
    {
      title: "Voir mes évaluations",
      description: "Consulter et gérer les évaluations",
      icon: "📋",
      link: "/evaluations",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700",
      showFor: ['enseignant', 'etudiant']
    },
    {
      title: "Mon profil",
      description: "Modifier mes informations personnelles",
      icon: "👤",
      link: "/profile",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700",
      showFor: ['enseignant', 'etudiant']
    },
    {
      title: "Voir les enseignants",
      description: "Consulter la liste des enseignants",
      icon: "👨‍🏫",
      link: "/teachers",
      color: "bg-cyan-50 border-cyan-200",
      textColor: "text-cyan-700",
      showFor: ['etudiant']
    },
    {
      title: "Uploader une vidéo",
      description: "Ajouter une vidéo de cours ou d’introduction",
      icon: "🎥",
      link: "/upload-teacher-video",
      color: "bg-indigo-50 border-indigo-200",
      textColor: "text-indigo-700",
      showFor: ['enseignant']
    }
  ];

  const recentActivities = [
    {
      type: "evaluation",
      title: "Devoir de mathématiques soumis",
      time: "Il y a 2 heures",
      icon: "📝",
      color: "text-green-600"
    },
    {
      type: "file",
      title: "Vidéo de cours uploadée",
      time: "Il y a 1 jour",
      icon: "🎥",
      color: "text-blue-600"
    },
    {
      type: "course",
      title: "Nouveau cours disponible",
      time: "Il y a 2 jours",
      icon: "📚",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-gray-600">
                Bienvenue, {user.firstName} {user.lastName} ({user.role})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <Link to={stat.link} className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800">
                Voir plus →
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions
              .filter(action => action.showFor.includes(user.role))
              .map((action, index) => {
                if (action.title === 'Upload de fichiers') {
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${action.color} ${action.textColor} hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => navigate('/file-upload-demo')}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{action.icon}</span>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm opacity-75">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={`p-4 rounded-lg border-2 ${action.color} ${action.textColor} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-75">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
                { id: 'evaluations', name: 'Évaluations', icon: '📝' },
                { id: 'files', name: 'Fichiers', icon: '📁' },
                { id: 'recent', name: 'Activités récentes', icon: '🕒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activities */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activités récentes</h3>
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xl">{activity.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques rapides</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700">Évaluations en attente</span>
                        <span className="font-bold text-blue-700">3</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Cours en cours</span>
                        <span className="font-bold text-green-700">2</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700">Fichiers partagés</span>
                        <span className="font-bold text-purple-700">15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluations Tab */}
            {activeTab === 'evaluations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Mes évaluations</h3>
                  {user.role === 'enseignant' && (
                    <Link
                      to="/evaluations/create"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Créer une évaluation
                    </Link>
                  )}
                </div>
                <EvaluationList userRole={user.role} />
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gestion des fichiers</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Section */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Upload de fichiers</h4>
                    <FileUploadEnhanced
                      accept="all"
                      onUploadComplete={handleFileUpload}
                      maxFiles={5}
                      maxSize={50}
                      showPreview={true}
                      simulateUpload={false}
                    />
                  </div>

                  {/* Upload Results */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Fichiers récents</h4>
                    {uploadResults.length > 0 ? (
                      <div className="space-y-2">
                        {uploadResults.map((result, index) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">✅</span>
                              <span className="font-medium text-green-800">{result.filename}</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                              Uploadé avec succès
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-50 rounded-lg">
                        <span className="text-4xl mb-4 block">📁</span>
                        <p className="text-gray-500">Aucun fichier uploadé récemment</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activities Tab */}
            {activeTab === 'recent' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Toutes les activités</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 ${activity.color} bg-opacity-10 rounded-full flex items-center justify-center`}>
                        <span className="text-xl">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Voir détails
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 