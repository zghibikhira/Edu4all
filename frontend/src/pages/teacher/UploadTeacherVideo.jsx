import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FileUploadEnhanced from '../../components/FileUploadEnhanced';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SUBJECTS = [
  'Mathématiques',
  'Physique',
  'Chimie',
  'Biologie',
  'Informatique',
  'Langues',
  'Histoire',
  'Géographie',
  'Autre'
];
const LEVELS = [
  'Primaire',
  'Collège',
  'Lycée',
  'Université',
  'Autre'
];

const UploadTeacherVideo = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    level: '',
    video: null
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (file) => {
    setForm({ ...form, video: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccess(null);
    setError(null);
    try {
      if (!form.video) throw new Error('Veuillez sélectionner une vidéo.');
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subject', form.subject);
      formData.append('level', form.level);
      formData.append('video', form.video);
      const res = await fetch('/api/files/videos/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Erreur lors de l\'upload.');
      setSuccess('Vidéo uploadée avec succès !');
      setForm({ title: '', description: '', subject: '', level: '', video: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <Card>
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload d'une vidéo d'enseignant</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Titre de la vidéo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Description de la vidéo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Matière *</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Niveau *</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vidéo *</label>
              <FileUploadEnhanced
                accept="video"
                maxFiles={1}
                maxSize={100}
                onFileChange={handleFileChange}
                showPreview={true}
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" variant="primary" size="lg" loading={uploading} disabled={uploading}>
              {uploading ? 'Upload en cours...' : 'Uploader la vidéo'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UploadTeacherVideo; 