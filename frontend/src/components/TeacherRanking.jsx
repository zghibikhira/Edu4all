import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaStar, 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaUsers, 
  FaEuroSign, 
  FaChartLine,
  FaFilter,
  FaSearch,
  FaSort,
  FaHeart,
  FaCalendar,
  FaGraduationCap,
  FaAward,
  FaEye,
  FaPaperPlane
} from 'react-icons/fa';

const TeacherRanking = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    minRating: 0,
    maxPrice: 1000,
    availability: 'all'
  });
  const [sortBy, setSortBy] = useState('rating');
  const [view, setView] = useState('grid');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      // Mock data pour les enseignants avec classement
      const mockTeachers = [
        {
          _id: '1',
          firstName: 'Marie',
          lastName: 'Dubois',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          subjects: ['Mathématiques', 'Physique'],
          level: 'Lycée',
          rating: 4.9,
          totalReviews: 156,
          hourlyRate: 45,
          totalStudents: 89,
          totalEarnings: 12500,
          rank: 'Hyperprof',
          rankIcon: FaCrown,
          rankColor: 'text-yellow-500',
          rankBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          isOnline: true,
          followers: 1250,
          posts: 23,
          availability: 'available',
          specializations: ['Algèbre', 'Calcul', 'Mécanique'],
          experience: 8,
          education: 'Doctorat en Mathématiques',
          achievements: ['Prix d\'Excellence 2023', 'Top 1% des enseignants']
        },
        {
          _id: '2',
          firstName: 'Jean',
          lastName: 'Martin',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          subjects: ['Histoire', 'Géographie'],
          level: 'Collège',
          rating: 4.7,
          totalReviews: 98,
          hourlyRate: 35,
          totalStudents: 67,
          totalEarnings: 8900,
          rank: 'Superprof',
          rankIcon: FaMedal,
          rankColor: 'text-purple-500',
          rankBg: 'bg-purple-100 dark:bg-purple-900/20',
          isOnline: false,
          followers: 890,
          posts: 15,
          availability: 'limited',
          specializations: ['Histoire moderne', 'Géopolitique'],
          experience: 5,
          education: 'Master en Histoire',
          achievements: ['Certification pédagogique', 'Top 5% des enseignants']
        },
        {
          _id: '3',
          firstName: 'Sophie',
          lastName: 'Bernard',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          subjects: ['Anglais', 'Espagnol'],
          level: 'Tous niveaux',
          rating: 4.8,
          totalReviews: 203,
          hourlyRate: 50,
          totalStudents: 134,
          totalEarnings: 16800,
          rank: 'Hyperprof',
          rankIcon: FaCrown,
          rankColor: 'text-yellow-500',
          rankBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          isOnline: true,
          followers: 2100,
          posts: 45,
          availability: 'available',
          specializations: ['Business English', 'Conversation', 'Préparation TOEFL'],
          experience: 10,
          education: 'Master en Langues Étrangères',
          achievements: ['Certification Cambridge', 'Top 1% des enseignants', 'Prix Innovation 2023']
        },
        {
          _id: '4',
          firstName: 'Pierre',
          lastName: 'Leroy',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          subjects: ['Informatique', 'Programmation'],
          level: 'Supérieur',
          rating: 4.6,
          totalReviews: 87,
          hourlyRate: 60,
          totalStudents: 45,
          totalEarnings: 7200,
          rank: 'Superprof',
          rankIcon: FaMedal,
          rankColor: 'text-purple-500',
          rankBg: 'bg-purple-100 dark:bg-purple-900/20',
          isOnline: true,
          followers: 567,
          posts: 12,
          availability: 'available',
          specializations: ['Python', 'JavaScript', 'React', 'Node.js'],
          experience: 6,
          education: 'Ingénieur en Informatique',
          achievements: ['Certification AWS', 'Top 10% des enseignants']
        },
        {
          _id: '5',
          firstName: 'Claire',
          lastName: 'Moreau',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          subjects: ['Français', 'Littérature'],
          level: 'Lycée',
          rating: 4.5,
          totalReviews: 76,
          hourlyRate: 40,
          totalStudents: 52,
          totalEarnings: 6800,
          rank: 'Prof',
          rankIcon: FaTrophy,
          rankColor: 'text-blue-500',
          rankBg: 'bg-blue-100 dark:bg-blue-900/20',
          isOnline: false,
          followers: 423,
          posts: 8,
          availability: 'limited',
          specializations: ['Analyse littéraire', 'Dissertation', 'Commentaire composé'],
          experience: 4,
          education: 'Master en Littérature Française',
          achievements: ['Certification pédagogique']
        }
      ];

      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankInfo = (rank) => {
    switch (rank) {
      case 'Hyperprof':
        return {
          icon: FaCrown,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          description: 'Top 1% des enseignants'
        };
      case 'Superprof':
        return {
          icon: FaMedal,
          color: 'text-purple-500',
          bg: 'bg-purple-100 dark:bg-purple-900/20',
          description: 'Top 5% des enseignants'
        };
      case 'Prof':
        return {
          icon: FaTrophy,
          color: 'text-blue-500',
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          description: 'Enseignant certifié'
        };
      default:
        return {
          icon: FaTrophy,
          color: 'text-gray-500',
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          description: 'Enseignant'
        };
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    if (filters.subject && !teacher.subjects.some(subject => 
      subject.toLowerCase().includes(filters.subject.toLowerCase())
    )) return false;
    
    if (filters.level && teacher.level !== filters.level) return false;
    
    if (teacher.rating < filters.minRating) return false;
    
    if (teacher.hourlyRate > filters.maxPrice) return false;
    
    if (filters.availability !== 'all' && teacher.availability !== filters.availability) return false;
    
    return true;
  });

  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'students':
        return b.totalStudents - a.totalStudents;
      case 'earnings':
        return b.totalEarnings - a.totalEarnings;
      default:
        return b.rating - a.rating;
    }
  });

  const subjects = [...new Set(teachers.flatMap(t => t.subjects))];
  const levels = [...new Set(teachers.map(t => t.level))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Classement des Enseignants
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Découvrez les meilleurs enseignants selon leurs performances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Matière
            </label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Toutes les matières</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Niveau
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous les niveaux</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note minimum
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={0}>Toutes les notes</option>
              <option value={4.0}>4.0+ étoiles</option>
              <option value={4.5}>4.5+ étoiles</option>
              <option value={4.8}>4.8+ étoiles</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix max (€/h)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disponibilité
            </label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tous</option>
              <option value="available">Disponible</option>
              <option value="limited">Limité</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="rating">Note</option>
              <option value="price">Prix</option>
              <option value="students">Étudiants</option>
              <option value="earnings">Revenus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedTeachers.map((teacher, index) => {
            const rankInfo = getRankInfo(teacher.rank);
            const RankIcon = rankInfo.icon;

            return (
              <div key={teacher._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header with Rank */}
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${rankInfo.bg} ${rankInfo.color}`}>
                      <RankIcon className="w-4 h-4" />
                      {teacher.rank}
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                  )}

                  <img 
                    src={teacher.avatar} 
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-white/80 text-sm">{teacher.subjects.join(', ')}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FaStar className="text-yellow-500 w-4 h-4" />
                        <span className="font-semibold text-gray-900 dark:text-white">{teacher.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{teacher.totalReviews} avis</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FaUsers className="text-blue-500 w-4 h-4" />
                        <span className="font-semibold text-gray-900 dark:text-white">{teacher.totalStudents}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Étudiants</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FaEuroSign className="text-green-500 w-4 h-4" />
                        <span className="font-semibold text-gray-900 dark:text-white">{teacher.hourlyRate}€</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Par heure</p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Spécialisations</h4>
                    <div className="flex flex-wrap gap-1">
                      {teacher.specializations.slice(0, 3).map((spec, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {spec}
                        </span>
                      ))}
                      {teacher.specializations.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          +{teacher.specializations.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Achievements */}
                  {teacher.achievements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <FaAward className="text-yellow-500 w-4 h-4" />
                        Réalisations
                      </h4>
                      <div className="space-y-1">
                        {teacher.achievements.slice(0, 2).map((achievement, idx) => (
                          <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                            • {achievement}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/teacher/${teacher._id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      Voir Profil
                    </Link>
                    <Link 
                      to="/slot-booking"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-sm"
                    >
                      Réserver
                    </Link>
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <FaHeart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && sortedTeachers.length === 0 && (
        <div className="text-center py-12">
          <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun enseignant trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherRanking;
