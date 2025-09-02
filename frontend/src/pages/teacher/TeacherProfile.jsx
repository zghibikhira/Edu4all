import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const TeacherProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    subjects: user?.teacherInfo?.subjects || [],
    experience: user?.teacherInfo?.experience || 0,
    education: user?.teacherInfo?.education || { degree: '', school: '', year: '' },
    languages: user?.teacherInfo?.languages || [],
    hourlyRate: user?.teacherInfo?.hourlyRate || 0,
    availability: user?.teacherInfo?.availability || { timezone: 'Europe/Paris', schedule: [] },
    availabilityMode: 'flexible',
    specializations: user?.teacherInfo?.specializations || []
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        subjects: user.teacherInfo?.subjects || [],
        experience: user.teacherInfo?.experience || 0,
        education: user.teacherInfo?.education || { degree: '', school: '', year: '' },
        languages: user.teacherInfo?.languages || [],
        hourlyRate: user.teacherInfo?.hourlyRate || 0,
        availability: user.teacherInfo?.availability || { timezone: 'Europe/Paris', schedule: [] },
        availabilityMode: 'flexible',
        specializations: user.teacherInfo?.specializations || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setProfile(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const profileData = {
        ...profile,
        teacherInfo: {
          subjects: profile.subjects,
          experience: profile.experience,
          education: profile.education,
          languages: profile.languages,
          hourlyRate: profile.hourlyRate,
          availability: typeof profile.availability === 'string' 
            ? { timezone: 'Europe/Paris', schedule: [] }
            : profile.availability,
          specializations: profile.specializations
        }
      };

      await updateProfile(profileData);
      setSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'enseignant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="text-gray-700">Cette page est réservée aux enseignants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil Enseignant</h1>
              <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
            </div>
            <Link 
              to="/teacher-dashboard" 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Parlez-nous de votre expérience, vos passions et votre approche pédagogique..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Teaching Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Informations d'enseignement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matières enseignées</label>
                  <input
                    type="text"
                    value={profile.subjects.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'subjects')}
                    placeholder="Mathématiques, Physique, Chimie..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
                  <input
                    type="number"
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux horaire (€)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={profile.hourlyRate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                  <select
                    name="availabilityMode"
                    value={profile.availabilityMode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flexible">Flexible</option>
                    <option value="weekdays">En semaine</option>
                    <option value="weekends">Weekends</option>
                    <option value="evenings">Soirées</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Formation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme</label>
                  <input
                    type="text"
                    name="education.degree"
                    value={profile.education.degree}
                    onChange={handleChange}
                    placeholder="Master en Mathématiques..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                  <input
                    type="text"
                    name="education.school"
                    value={profile.education.school}
                    onChange={handleChange}
                    placeholder="Université de Paris..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <input
                    type="number"
                    name="education.year"
                    value={profile.education.year}
                    onChange={handleChange}
                    min="1900"
                    max="2030"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Languages and Specializations */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Langues et spécialisations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langues parlées</label>
                  <input
                    type="text"
                    value={profile.languages.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'languages')}
                    placeholder="Français, Anglais, Espagnol..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spécialisations</label>
                  <input
                    type="text"
                    value={profile.specializations.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'specializations')}
                    placeholder="Calcul différentiel, Algèbre linéaire..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder le profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
