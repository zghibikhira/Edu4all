import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../utils/api';
import FileUpload from '../../components/FileUpload';
// import FileUploadEnhanced from '../components/FileUploadEnhanced'; // Will be used later

const Profile = () => {
  const { user, token, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile(user);
    } else {
      // Fetch profile from API
      setLoading(true);
      authAPI.getProfile()
        .then(res => {
          setProfile(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStudentInfoChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      studentInfo: { ...prev.studentInfo, [name]: value }
    }));
  };

  const handleTeacherInfoChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      teacherInfo: { ...prev.teacherInfo, [name]: value }
    }));
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      // Note: You'll need to add a file upload endpoint to your API
      // For now, we'll use a placeholder
      const res = await fetch('/api/files/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      setProfile((prev) => ({ ...prev, avatar: data.data.fileUrl }));
      setMessage('Avatar uploaded!');
    } catch (err) {
      setMessage('Avatar upload failed.');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profile);
      if (result.success) {
        setProfile(result.user || profile);
        setEditMode(false);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.error || 'Update failed.');
      }
    } catch (err) {
      setMessage('Update failed.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await updateProfile(form);
      setSuccess('Profil mis à jour avec succès !');
      setEditing(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  if (!profile) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] bg-[#F5F5F5] py-8">
        <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div>
            <img
              src={avatarPreview || profile.avatar || '/default-avatar.png'}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border"
            />
            {editMode && (
              <div className="mt-2">
                <FileUpload accept="image/*" onFileChange={handleAvatarChange} />
                <button
                  className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleAvatarUpload}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Avatar'}
                </button>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{profile.firstName} {profile.lastName}</h2>
            <p className="text-gray-600 mb-1">{profile.email}</p>
            <p className="text-sm text-gray-500">Role: {profile.role}</p>
            <button
              className="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setEditMode((e) => !e)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
        {message && <div className="mb-4 text-blue-600">{message}</div>}
        {!editing ? (
          <button onClick={() => setEditing(true)} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit Profile</button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
            <button type="submit" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
          </form>
        )}
        {success && <div className="mt-4 text-green-600">{success}</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName || ''}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName || ''}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={profile.phone || ''}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
          {/* Student Info */}
          {profile.role === 'etudiant' && profile.studentInfo && (
            <div className="bg-blue-50 rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">Level</label>
                  <input
                    type="text"
                    name="level"
                    value={profile.studentInfo.level || ''}
                    onChange={handleStudentInfoChange}
                    disabled={!editMode}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Languages</label>
                  <input
                    type="text"
                    name="languages"
                    value={profile.studentInfo.languages?.join(', ') || ''}
                    onChange={e => handleStudentInfoChange({ target: { name: 'languages', value: e.target.value.split(',').map(s => s.trim()) } })}
                    disabled={!editMode}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-gray-700">Accessibility Needs</label>
                <input
                  type="text"
                  name="accessibility"
                  value={profile.studentInfo.accessibility?.needs?.join(', ') || ''}
                  onChange={e => handleStudentInfoChange({ target: { name: 'accessibility', value: { ...profile.studentInfo.accessibility, needs: e.target.value.split(',').map(s => s.trim()) } } })}
                  disabled={!editMode}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
            </div>
          )}
          {/* Teacher Info */}
          {profile.role === 'enseignant' && profile.teacherInfo && (
            <div className="bg-purple-50 rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Teacher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700">Subjects</label>
                  <input
                    type="text"
                    name="subjects"
                    value={profile.teacherInfo.subjects?.join(', ') || ''}
                    onChange={e => handleTeacherInfoChange({ target: { name: 'subjects', value: e.target.value.split(',').map(s => s.trim()) } })}
                    disabled={!editMode}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={profile.teacherInfo.education?.degree || ''}
                    onChange={e => handleTeacherInfoChange({ target: { name: 'education', value: { ...profile.teacherInfo.education, degree: e.target.value } } })}
                    disabled={!editMode}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-gray-700">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={profile.teacherInfo.experience || 0}
                  onChange={handleTeacherInfoChange}
                  disabled={!editMode}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
            </div>
          )}
          {editMode && (
            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>
        </div>
      </div>
  );
};

export default Profile; 