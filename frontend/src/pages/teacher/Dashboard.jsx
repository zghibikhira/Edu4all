import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChatSummary from '../../components/ChatSummary';
import WalletSummary from '../../components/WalletSummary';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: "Évaluations",
      value: "12 créées",
      icon: "📊",
      color: "bg-blue-500",
      link: "/evaluations"
    },
    {
      title: "Cours",
      value: "5 enseignés",
      icon: "📚",
      color: "bg-green-500",
      link: "/courses"
    },
    {
      title: "Étudiants",
      value: "24 inscrits",
      icon: "👥",
      color: "bg-purple-500",
      link: "#students"
    },
    {
      title: "Revenus",
      value: "€1,250",
      icon: "💰",
      color: "bg-orange-500",
      link: "/wallet"
    }
  ];

  const quickActions = [
    {
      title: "Créer une évaluation",
      description: "Assigner un nouveau devoir ou projet",
      icon: "📝",
      link: "/evaluations/create",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700"
    },
    {
      title: "Gérer les créneaux",
      description: "Définir vos disponibilités pour les meetings",
      icon: "🗓️",
      link: "/define-slots",
      color: "bg-teal-50 border-teal-200",
      textColor: "text-teal-700"
    },
    {
      title: "Upload de vidéos",
      description: "Ajouter des vidéos à vos cours",
      icon: "🎥",
      link: "/upload-teacher-video",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700"
    },
    {
      title: "Mon profil",
      description: "Modifier mes informations personnelles",
      icon: "👤",
      link: "/instructor/profile",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700"
    },
    {
      title: "Chat",
      description: "Discuter avec les étudiants",
      icon: "💬",
      link: "/chat",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700"
    },
    {
      title: "Mon Wallet",
      description: "Gérer mon solde et mes transactions",
      icon: "💰",
      link: "/wallet",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-700"
    }
  ];

  const recentActivities = [
    {
      type: "evaluation",
      title: "Nouvelle évaluation créée",
      time: "Il y a 1 heure",
      icon: "📝",
      color: "text-green-600"
    },
    {
      type: "video",
      title: "Vidéo de cours uploadée",
      time: "Il y a 3 heures",
      icon: "🎥",
      color: "text-blue-600"
    },
    {
      type: "meeting",
      title: "Meeting réservé par un étudiant",
      time: "Il y a 1 jour",
      icon: "📅",
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
                Tableau de bord enseignant
              </h1>
              <p className="text-gray-600">
                Bienvenue, {user?.firstName} {user?.lastName} (Enseignant)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
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
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
                { id: 'evaluations', name: 'Évaluations', icon: '📝' },
                { id: 'students', name: 'Mes étudiants', icon: '👥' },
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
                        <span className="font-bold text-blue-700">5</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Cours actifs</span>
                        <span className="font-bold text-green-700">3</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700">Meetings aujourd'hui</span>
                        <span className="font-bold text-purple-700">2</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Wallet and Chat Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WalletSummary />
                  <ChatSummary />
                </div>
              </div>
            )}

            {/* Evaluations Tab */}
            {activeTab === 'evaluations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Mes évaluations</h3>
                  <Link
                    to="/evaluations/create"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Créer une évaluation
                  </Link>
                </div>
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📝</span>
                  <p className="text-gray-500">Gérez vos évaluations ici</p>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mes étudiants</h3>
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">👥</span>
                  <p className="text-gray-500">Liste de vos étudiants</p>
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

export default TeacherDashboard; 