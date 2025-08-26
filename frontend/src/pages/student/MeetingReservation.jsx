import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaVideo,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaStar,
  FaBook,
  FaGraduationCap
} from 'react-icons/fa';

const MeetingReservation = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        // Mock data for teachers
        const mockTeachers = [
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            subject: 'Mathematics',
            rating: 4.8,
            totalStudents: 156,
            availableSlots: 12,
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            description: 'Experienced mathematics teacher with 10+ years of teaching experience.',
            specialties: ['Algebra', 'Calculus', 'Statistics']
          },
          {
            id: 2,
            name: 'Prof. Michael Chen',
            subject: 'Programming',
            rating: 4.9,
            totalStudents: 203,
            availableSlots: 8,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            description: 'Software engineer and programming instructor specializing in web development.',
            specialties: ['JavaScript', 'React', 'Node.js']
          },
          {
            id: 3,
            name: 'Prof. Emily Davis',
            subject: 'Web Development',
            rating: 4.7,
            totalStudents: 189,
            availableSlots: 15,
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            description: 'Frontend development expert with focus on modern frameworks.',
            specialties: ['React', 'Vue.js', 'CSS']
          },
          {
            id: 4,
            name: 'Dr. Robert Wilson',
            subject: 'Physics',
            rating: 4.6,
            totalStudents: 134,
            availableSlots: 6,
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            description: 'Physics professor with research background in quantum mechanics.',
            specialties: ['Mechanics', 'Thermodynamics', 'Quantum Physics']
          }
        ];

        setTeachers(mockTeachers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading teachers:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadTeachers();
    }
  }, [user]);

  const loadAvailableSlots = async (teacherId) => {
    try {
      // Mock data for available slots
      const mockSlots = [
        { id: 1, date: '2025-08-25', time: '09:00', duration: 60, type: 'video' },
        { id: 2, date: '2025-08-25', time: '14:00', duration: 60, type: 'video' },
        { id: 3, date: '2025-08-26', time: '10:00', duration: 90, type: 'video' },
        { id: 4, date: '2025-08-26', time: '16:00', duration: 60, type: 'video' },
        { id: 5, date: '2025-08-27', time: '11:00', duration: 60, type: 'video' },
        { id: 6, date: '2025-08-28', time: '15:00', duration: 90, type: 'video' }
      ];

      setAvailableSlots(mockSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedSlot(null);
    loadAvailableSlots(teacher.id);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleReservation = async () => {
    if (!selectedTeacher || !selectedSlot) {
      alert('Veuillez sélectionner un enseignant et un créneau.');
      return;
    }

    try {
      // Mock reservation API call
      console.log('Reserving slot:', {
        teacherId: selectedTeacher.id,
        slotId: selectedSlot.id,
        studentId: user.id
      });

      alert('Réservation effectuée avec succès!');
      // Reset selections
      setSelectedTeacher(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSubject === 'all' || teacher.subject === filterSubject;
    return matchesSearch && matchesFilter;
  });

  const subjects = ['all', ...new Set(teachers.map(t => t.subject))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement des enseignants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Réserver un Meeting
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Choisissez un enseignant et réservez un créneau
              </p>
            </div>
            <Link
              to="/calendar"
              className="btn-secondary flex items-center gap-2"
            >
              <FaCalendarAlt />
              Voir mon calendrier
            </Link>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un enseignant ou une matière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'Toutes les matières' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teachers List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Enseignants disponibles
            </h2>
            <div className="grid gap-6">
              {filteredTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  className={`card p-6 cursor-pointer transition-all duration-200 ${
                    selectedTeacher?.id === teacher.id
                      ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleTeacherSelect(teacher)}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {teacher.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <FaStar className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {teacher.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-primary font-medium mb-2">
                        {teacher.subject}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {teacher.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaGraduationCap />
                          {teacher.totalStudents} étudiants
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {teacher.availableSlots} créneaux disponibles
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {teacher.specialties.map(specialty => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Slots */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Créneaux disponibles
            </h2>
            {selectedTeacher ? (
              <div className="space-y-4">
                {availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucun créneau disponible pour le moment.
                    </p>
                  </div>
                ) : (
                  availableSlots.map(slot => (
                    <div
                      key={slot.id}
                      className={`card p-4 cursor-pointer transition-all duration-200 ${
                        selectedSlot?.id === slot.id
                          ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {slot.time} • {slot.duration} min
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaVideo className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-500">Vidéo</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {selectedSlot && (
                  <div className="mt-6">
                    <button
                      onClick={handleReservation}
                      className="w-full btn-primary"
                    >
                      Réserver ce créneau
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Sélectionnez un enseignant pour voir les créneaux disponibles.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/calendar" className="card-hover p-6 text-center group">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaCalendarAlt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Mon Calendrier
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Voir tous mes rendez-vous
              </p>
            </Link>

            <Link to="/teacher-ratings" className="card-hover p-6 text-center group">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaStar className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Évaluer les enseignants
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Donner votre avis sur les cours
              </p>
            </Link>

            <Link to="/courses" className="card-hover p-6 text-center group">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaBook className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Voir les cours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Découvrir de nouveaux cours
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingReservation;
