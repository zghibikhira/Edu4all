import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaGraduationCap, 
  FaLanguage, 
  FaBook, 
  FaEuroSign,
  FaCamera,
  FaBell,
  FaLock,
  FaGlobe,
  FaHeart,
  FaCalendar,
  FaMapMarkerAlt,
  FaCog
} from 'react-icons/fa';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    level: user?.level || 'Lycée',
    languages: user?.languages || ['Français'],
    preferredSubjects: user?.preferredSubjects || ['Mathématiques'],
    maxBudget: user?.maxBudget || 50,
    location: user?.location || '',
    bio: user?.bio || '',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      profilePublic: true,
      showProgress: true,
      allowMessages: true
    }
  });

  const levels = ['Primaire', 'Collège', 'Lycée', 'Supérieur', 'Formation continue'];
  const availableLanguages = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Arabe'];
  const availableSubjects = [
    'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie',
    'Français', 'Anglais', 'Espagnol', 'Allemand', 'Philosophie', 'Économie',
    'Informatique', 'Art', 'Musique', 'Sport', 'Sciences politiques'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field, value, action) => {
    setProfileData(prev => ({
      ...prev,
      [field]: action === 'add' 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simuler une mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateUser(profileData);
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      level: user?.level || 'Lycée',
      languages: user?.languages || ['Français'],
      preferredSubjects: user?.preferredSubjects || ['Mathématiques'],
      maxBudget: user?.maxBudget || 50,
      location: user?.location || '',
      bio: user?.bio || '',
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      privacy: {
        profilePublic: true,
        showProgress: true,
        allowMessages: true
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mon Profil Étudiant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src={profileData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
              alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                  {isEditing && (
                    <button className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <FaCamera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Étudiant</p>

                <div className="mt-6 flex gap-2">
                  {isEditing ? (
                    <>
                <button
                        onClick={handleSave}
                  disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FaSave className="w-4 h-4" />
                        )}
                        Sauvegarder
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      Modifier
                </button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Statistiques</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cours suivis</span>
                    <span className="font-medium text-gray-900 dark:text-white">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Moyenne</span>
                    <span className="font-medium text-gray-900 dark:text-white">4.7/5</span>
          </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                    <span className="font-medium text-gray-900 dark:text-white">8</span>
          </div>
        </div>
            </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Informations Personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localisation
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Ville, Pays"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau
                  </label>
                  <select
                    name="level"
                    value={profileData.level}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Parlez-nous un peu de vous..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {/* Academic Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaGraduationCap className="text-green-600" />
                Préférences Académiques
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Langues parlées
                  </label>
                  <div className="space-y-2">
                    {availableLanguages.map(lang => (
                      <label key={lang} className="flex items-center gap-2">
                  <input
                          type="checkbox"
                          checked={profileData.languages.includes(lang)}
                          onChange={(e) => handleArrayChange('languages', lang, e.target.checked ? 'add' : 'remove')}
                          disabled={!isEditing}
                          className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matières préférées
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableSubjects.map(subject => (
                      <label key={subject} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profileData.preferredSubjects.includes(subject)}
                          onChange={(e) => handleArrayChange('preferredSubjects', subject, e.target.checked ? 'add' : 'remove')}
                          disabled={!isEditing}
                          className="text-green-600 focus:ring-green-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget maximum par session (€)
                </label>
                <div className="relative">
                  <FaEuroSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="maxBudget"
                    value={profileData.maxBudget}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    min="0"
                    max="200"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaCog className="text-purple-600" />
                Paramètres
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaBell className="text-blue-600" />
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={profileData.notifications.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Notifications par email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="notifications.sms"
                        checked={profileData.notifications.sms}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Notifications SMS</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="notifications.push"
                        checked={profileData.notifications.push}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Notifications push</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaLock className="text-green-600" />
                    Confidentialité
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="privacy.profilePublic"
                        checked={profileData.privacy.profilePublic}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="text-green-600 focus:ring-green-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Profil public</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="privacy.showProgress"
                        checked={profileData.privacy.showProgress}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="text-green-600 focus:ring-green-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Afficher mes progrès</span>
                    </label>
                    <label className="flex items-center gap-2">
                <input
                        type="checkbox"
                        name="privacy.allowMessages"
                        checked={profileData.privacy.allowMessages}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="text-green-600 focus:ring-green-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Autoriser les messages</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
        </div>
      </div>
  );
};

export default StudentProfile; 