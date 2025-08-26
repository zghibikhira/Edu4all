import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../utils/api';
import { FaChalkboardTeacher, FaEnvelope, FaBook, FaGraduationCap, FaSearch, FaEye } from 'react-icons/fa';

// Exemples de matières et niveaux (à adapter selon ta base)
const SUBJECTS = [
  'Mathématiques', 'Physique', 'Chimie', 'Anglais', 'Français', 'Histoire', 'Géographie', 'SVT', 'Informatique', 'Philosophie', 'Économie', 'Espagnol', 'Allemand'
];
const LEVELS = [
  'Primaire', 'Collège', 'Lycée', 'Supérieur'
];

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchName, setSearchName] = useState('');

  // Pour multi-select, utiliser un tableau et adapter le backend (déjà prêt)
  // const [selectedSubjects, setSelectedSubjects] = useState([]);
  // const [selectedLevels, setSelectedLevels] = useState([]);

  const fetchTeachers = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      // Construction de la query string
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.level) params.append('level', filters.level);
      if (filters.name) params.append('name', filters.name);
      const res = await teacherAPI.getAll(params.toString() ? `?${params.toString()}` : '');
      setTeachers(res.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des enseignants.');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Gestion du filtrage
  const handleFilter = (e) => {
    e.preventDefault();
    fetchTeachers({
      subject: selectedSubject,
      level: selectedLevel,
      name: searchName
    });
  };

  return (
    <div>
      {/* Filtres */}
      <form onSubmit={handleFilter} className="mb-8 flex flex-wrap gap-4 items-end justify-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="border rounded-lg px-3 py-2 w-40"
          >
            <option value="">Toutes</option>
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="border rounded-lg px-3 py-2 w-40"
          >
            <option value="">Tous</option>
            {LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <div className="flex items-center border rounded-lg px-2">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="Rechercher par nom"
              className="py-2 w-40 outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Filtrer
        </button>
      </form>

      {/* Liste des enseignants */}
      {loading ? (
        <div className="text-center py-12">Chargement des enseignants...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">{error}</div>
      ) : !teachers.length ? (
        <div className="text-center py-12">Aucun enseignant trouvé.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-100 hover:shadow-xl transition-all">
              <div className="mb-4">
                {teacher.teacherInfo?.avatar ? (
                  <img
                    src={teacher.teacherInfo.avatar}
                    alt={teacher.firstName + ' ' + teacher.lastName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl">
                    <FaChalkboardTeacher />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span>{teacher.firstName} {teacher.lastName}</span>
                {teacher.teacherInfo?.rank && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${teacher.teacherInfo.rank === 'Hyperprof' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : teacher.teacherInfo.rank === 'Superprof' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                    {teacher.teacherInfo.rank}
                  </span>
                )}
              </h3>
              <div className="text-sm text-gray-500 mb-2 flex items-center">
                <FaEnvelope className="mr-1" /> {teacher.email}
              </div>
              <div className="text-sm text-gray-600 mb-2 flex items-center">
                <FaBook className="mr-1" />
                {teacher.teacherInfo?.subjects && teacher.teacherInfo.subjects.length > 0
                  ? teacher.teacherInfo.subjects.join(', ')
                  : 'Matière non renseignée'}
              </div>
              <div className="text-sm text-gray-600 mb-2 flex items-center">
                <FaGraduationCap className="mr-1" />
                {teacher.teacherInfo?.education?.degree || 'Niveau non renseigné'}
              </div>
              {teacher.teacherInfo?.metrics?.avgRating ? (
                <div className="text-xs text-gray-500 mt-2">⭐ {teacher.teacherInfo.metrics.avgRating.toFixed(1)} · {teacher.teacherInfo.metrics.reviewsCount || teacher.teacherInfo.totalReviews || 0} avis</div>
              ) : (
                <div className="text-xs text-gray-400 mt-2">{teacher.teacherInfo?.rank ? `Rang : ${teacher.teacherInfo.rank}` : ''}</div>
              )}
              <Link 
                to={`/teacher/${teacher._id}`}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEye />
                Voir le profil
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeachersList; 