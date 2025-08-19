import React, { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaSms, FaMobile, FaSave, FaUndo, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { preferencesAPI } from '../utils/api';

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState(null);

  // Notification types with descriptions
  const notificationTypes = [
    {
      key: 'SESSION_BOOKED',
      label: 'Sessions réservées',
      description: 'Quand une session est réservée'
    },
    {
      key: 'SESSION_UPDATED',
      label: 'Sessions modifiées',
      description: 'Quand une session est modifiée'
    },
    {
      key: 'SESSION_CANCELLED',
      label: 'Sessions annulées',
      description: 'Quand une session est annulée'
    },
    {
      key: 'SESSION_REMINDER',
      label: 'Rappels de sessions',
      description: 'Rappels avant le début des sessions'
    },
    {
      key: 'PAYMENT_CONFIRMED',
      label: 'Paiements confirmés',
      description: 'Quand un paiement est confirmé'
    },
    {
      key: 'PAYMENT_FAILED',
      label: 'Échecs de paiement',
      description: 'Quand un paiement échoue'
    },
    {
      key: 'PAYMENT_REFUNDED',
      label: 'Remboursements',
      description: 'Quand un remboursement est effectué'
    },
    {
      key: 'EVALUATION_SUBMITTED',
      label: 'Évaluations soumises',
      description: 'Quand une évaluation est soumise'
    },
    {
      key: 'EVALUATION_GRADED',
      label: 'Évaluations notées',
      description: 'Quand une évaluation est notée'
    },
    {
      key: 'COURSE_PURCHASED',
      label: 'Cours achetés',
      description: 'Quand un cours est acheté'
    },
    {
      key: 'COURSE_COMPLETED',
      label: 'Cours terminés',
      description: 'Quand un cours est terminé'
    },
    {
      key: 'COMMENT_ADDED',
      label: 'Nouveaux commentaires',
      description: 'Quand un commentaire est ajouté'
    },
    {
      key: 'FOLLOW_ADDED',
      label: 'Nouveaux abonnements',
      description: 'Quand quelqu\'un vous suit'
    },
    {
      key: 'SYSTEM_ANNOUNCEMENT',
      label: 'Annonces système',
      description: 'Annonces importantes du système'
    }
  ];

  // Fetch user preferences
  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await preferencesAPI.getPreferences();
      const prefs = response.data.data;
      setPreferences(prefs);
      setOriginalPreferences(JSON.parse(JSON.stringify(prefs)));
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    try {
      setIsSaving(true);
      await preferencesAPI.updatePreferences(preferences);
      setOriginalPreferences(JSON.parse(JSON.stringify(preferences)));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset preferences
  const resetPreferences = async () => {
    try {
      setIsLoading(true);
      await preferencesAPI.resetPreferences();
      await fetchPreferences();
      setHasChanges(false);
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  // Update notification preference
  const updateNotificationPreference = (type, channel, enabled) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [channel]: {
          ...prev.notifications[channel],
          [type]: enabled
        }
      }
    }));
    setHasChanges(true);
  };

  // Update general preference
  const updateGeneralPreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Update privacy preference
  const updatePrivacyPreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  // Check if preferences have changed
  useEffect(() => {
    if (preferences && originalPreferences) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
      setHasChanges(changed);
    }
  }, [preferences, originalPreferences]);

  // Fetch preferences on component mount
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaCog className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des préférences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur lors du chargement des préférences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paramètres des notifications
          </h1>
          <p className="text-gray-600">
            Personnalisez vos préférences de notifications et de confidentialité
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'notifications', label: 'Notifications', icon: FaBell },
              { key: 'general', label: 'Général', icon: FaCog },
              { key: 'privacy', label: 'Confidentialité', icon: FaCog }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Préférences de notifications
                </h2>
                <p className="text-gray-600 mb-6">
                  Choisissez comment vous souhaitez recevoir vos notifications pour chaque type d'événement.
                </p>
              </div>

              <div className="space-y-6">
                {notificationTypes.map((type) => (
                  <div key={type.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {type.label}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {type.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* In-App */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.notifications.inAppOn[type.key]}
                          onChange={(e) => updateNotificationPreference(type.key, 'inAppOn', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <FaBell className="text-blue-600" />
                          <span className="text-sm text-gray-700">In-App</span>
                        </div>
                      </label>

                      {/* Email */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.notifications.emailOn[type.key]}
                          onChange={(e) => updateNotificationPreference(type.key, 'emailOn', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-green-600" />
                          <span className="text-sm text-gray-700">Email</span>
                        </div>
                      </label>

                      {/* SMS */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.notifications.smsOn[type.key]}
                          onChange={(e) => updateNotificationPreference(type.key, 'smsOn', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <FaMobile className="text-purple-600" />
                          <span className="text-sm text-gray-700">SMS</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Préférences générales
                </h2>
                <p className="text-gray-600">
                  Configurez vos préférences générales d'interface et de langue.
                </p>
              </div>

              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    value={preferences.general.language}
                    onChange={(e) => updateGeneralPreference('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    value={preferences.general.timezone}
                    onChange={(e) => updateGeneralPreference('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème
                  </label>
                  <select
                    value={preferences.general.theme}
                    onChange={(e) => updateGeneralPreference('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Paramètres de confidentialité
                </h2>
                <p className="text-gray-600">
                  Contrôlez qui peut voir vos informations et vous contacter.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    key: 'showOnlineStatus',
                    label: 'Afficher le statut en ligne',
                    description: 'Permettre aux autres de voir quand vous êtes en ligne'
                  },
                  {
                    key: 'showLastSeen',
                    label: 'Afficher la dernière connexion',
                    description: 'Permettre aux autres de voir votre dernière activité'
                  },
                  {
                    key: 'allowDirectMessages',
                    label: 'Autoriser les messages privés',
                    description: 'Permettre aux autres de vous envoyer des messages privés'
                  },
                  {
                    key: 'allowCourseInvites',
                    label: 'Autoriser les invitations de cours',
                    description: 'Permettre aux enseignants de vous inviter à des cours'
                  }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={preferences.privacy[setting.key]}
                      onChange={(e) => updatePrivacyPreference(setting.key, e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {setting.label}
                      </label>
                      <p className="text-xs text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetPreferences}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaUndo className="text-sm" />
              <span>Réinitialiser</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {hasChanges && (
              <span className="text-sm text-orange-600">
                Vous avez des modifications non sauvegardées
              </span>
            )}
            
            <button
              onClick={savePreferences}
              disabled={!hasChanges || isSaving}
              className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className="text-sm" />
              <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
