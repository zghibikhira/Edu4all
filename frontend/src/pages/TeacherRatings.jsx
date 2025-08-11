import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TeacherRatingForm from '../components/TeacherRatingForm';
import { FaStar, FaThumbsUp, FaThumbsDown, FaUserGraduate, FaChartBar, FaPlus } from 'react-icons/fa';

const TeacherRatings = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [topTeachers, setTopTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchTopTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Extract unique teachers from courses
        const teacherMap = new Map();
        data.data.forEach(course => {
          if (course.instructor && !teacherMap.has(course.instructor._id)) {
            teacherMap.set(course.instructor._id, {
              ...course.instructor,
              courses: [course]
            });
          } else if (course.instructor && teacherMap.has(course.instructor._id)) {
            teacherMap.get(course.instructor._id).courses.push(course);
          }
        });
        
        setTeachers(Array.from(teacherMap.values()));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopTeachers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teacher-ratings/top?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setTopTeachers(data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des meilleurs enseignants:', error);
    }
  };

  const handleRateTeacher = (teacher, course = null) => {
    setSelectedTeacher(teacher);
    setSelectedCourse(course);
    setShowRatingForm(true);
  };

  const handleRatingSubmitted = (rating) => {
    // Refresh data after rating submission
    fetchTeachers();
    fetchTopTeachers();
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesFilter = filter === 'all' || 
      (filter === 'rated' && teacher.stats?.averageRating > 0) ||
      (filter === 'unrated' && (!teacher.stats || teacher.stats.averageRating === 0));
    
    const matchesSearch = teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${size} ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des enseignants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Évaluations des Enseignants</h1>
          <p className="mt-2 text-gray-600">
            Découvrez et évaluez les enseignants de notre plateforme
          </p>
        </div>

        {/* Top Teachers Section */}
        {topTeachers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Meilleurs Enseignants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topTeachers.map((teacher, index) => (
                <div key={teacher._id} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {teacher.teacher?.firstName} {teacher.teacher?.lastName}
                      </h3>
                      <div className="flex items-center gap-2">
                        {renderStars(Math.round(teacher.averageRating), 'text-sm')}
                        <span className="text-sm text-gray-600">
                          ({teacher.totalRatings} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Note moyenne: <span className="font-semibold">{teacher.averageRating.toFixed(1)}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom ou matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les enseignants</option>
                <option value="rated">Avec évaluations</option>
                <option value="unrated">Sans évaluations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTeachers.length} enseignants
              </div>
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="space-y-4">
          {filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun enseignant trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Aucun enseignant disponible pour le moment.'
                }
              </p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div key={teacher._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Teacher Info */}
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FaUserGraduate className="text-white text-2xl" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                        
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {teacher.subjects.map((subject, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        )}

                        {teacher.stats && teacher.stats.averageRating > 0 ? (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {renderStars(teacher.stats.averageRating)}
                              <span className="font-medium text-gray-900">
                                {teacher.stats.averageRating.toFixed(1)}/5
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {teacher.stats.totalRatings} évaluation(s)
                            </span>
                            {teacher.stats.recommendationRate > 0 && (
                              <span className="text-sm text-green-600">
                                {Math.round(teacher.stats.recommendationRate)}% recommandent
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Aucune évaluation pour le moment</p>
                        )}

                        {teacher.courses && teacher.courses.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Cours disponibles: {teacher.courses.length}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {teacher.courses.slice(0, 3).map((course) => (
                                <span
                                  key={course._id}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {course.title}
                                </span>
                              ))}
                              {teacher.courses.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  +{teacher.courses.length - 3} autres
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {user && user.role === 'etudiant' && (
                      <button
                        onClick={() => handleRateTeacher(teacher)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaPlus className="mr-2" />
                        Évaluer
                      </button>
                    )}
                    
                    {teacher.courses && teacher.courses.length > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Évaluer un cours spécifique:</p>
                        <div className="space-y-1">
                          {teacher.courses.slice(0, 2).map((course) => (
                            <button
                              key={course._id}
                              onClick={() => handleRateTeacher(teacher, course)}
                              className="block w-full px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                              {course.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && selectedTeacher && (
        <TeacherRatingForm
          teacher={selectedTeacher}
          course={selectedCourse}
          onRatingSubmitted={handleRatingSubmitted}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedTeacher(null);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherRatings;
