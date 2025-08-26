import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaUsers, 
  FaGraduationCap, 
  FaClock,
  FaMapMarkerAlt,
  FaBook,
  FaVideo,
  FaEye,
  FaHeart,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';

const Instructors = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    language: '',
    availability: '',
    rating: '',
    priceRange: ''
  });
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [teachersPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for teachers
  const mockTeachers = [
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dubois',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      subjects: ['Mathématiques', 'Physique'],
      levels: ['Lycée', 'Supérieur'],
      languages: ['Français', 'Anglais'],
      rating: 4.8,
      totalRatings: 127,
      students: 45,
      experience: 8,
      hourlyRate: 25,
      availability: ['Lundi', 'Mercredi', 'Vendredi'],
      bio: 'Professeur expérimenté en mathématiques et physique avec 8 ans d\'expérience. Spécialisé dans la préparation aux examens du baccalauréat.',
      education: ['Master en Mathématiques', 'CAPES'],
      location: 'Paris',
      isOnline: true,
      isVerified: true,
      specializations: ['Algèbre', 'Calcul différentiel', 'Mécanique quantique']
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Laurent',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      subjects: ['Français', 'Littérature'],
      levels: ['Collège', 'Lycée'],
      languages: ['Français'],
      rating: 4.7,
      totalRatings: 89,
      students: 32,
      experience: 5,
      hourlyRate: 20,
      availability: ['Mardi', 'Jeudi', 'Samedi'],
      bio: 'Enseignante passionnée de français et littérature. J\'aide les élèves à développer leur expression écrite et orale.',
      education: ['Master en Littérature française', 'CAPES'],
      location: 'Lyon',
      isOnline: false,
      isVerified: true,
      specializations: ['Grammaire', 'Analyse littéraire', 'Expression écrite']
    },
    {
      id: 3,
      firstName: 'Pierre',
      lastName: 'Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      subjects: ['Physique', 'Chimie'],
      levels: ['Lycée', 'Supérieur'],
      languages: ['Français', 'Anglais', 'Espagnol'],
      rating: 4.9,
      totalRatings: 156,
      students: 67,
      experience: 12,
      hourlyRate: 30,
      availability: ['Lundi', 'Mercredi', 'Vendredi', 'Samedi'],
      bio: 'Docteur en physique avec 12 ans d\'expérience dans l\'enseignement. Spécialisé en mécanique et thermodynamique.',
      education: ['Doctorat en Physique', 'Agrégation'],
      location: 'Marseille',
      isOnline: true,
      isVerified: true,
      specializations: ['Mécanique', 'Thermodynamique', 'Optique']
    },
    {
      id: 4,
      firstName: 'Sophie',
      lastName: 'Bernard',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      subjects: ['Anglais', 'Espagnol'],
      levels: ['Primaire', 'Collège', 'Lycée'],
      languages: ['Français', 'Anglais', 'Espagnol'],
      rating: 4.6,
      totalRatings: 94,
      students: 28,
      experience: 6,
      hourlyRate: 22,
      availability: ['Mardi', 'Jeudi', 'Samedi'],
      bio: 'Professeure de langues vivantes avec une approche communicative et interactive. Cours adaptés à tous les niveaux.',
      education: ['Master en Langues étrangères', 'CAPES'],
      location: 'Toulouse',
      isOnline: false,
      isVerified: true,
      specializations: ['Conversation', 'Grammaire', 'Préparation examens']
    },
    {
      id: 5,
      firstName: 'Antoine',
      lastName: 'Rousseau',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      subjects: ['Histoire', 'Géographie'],
      levels: ['Collège', 'Lycée'],
      languages: ['Français', 'Anglais'],
      rating: 4.5,
      totalRatings: 73,
      students: 23,
      experience: 4,
      hourlyRate: 18,
      availability: ['Lundi', 'Mercredi', 'Vendredi'],
      bio: 'Enseignant d\'histoire-géographie passionné par la transmission du savoir. Méthodes pédagogiques innovantes.',
      education: ['Master en Histoire', 'CAPES'],
      location: 'Nantes',
      isOnline: true,
      isVerified: false,
      specializations: ['Histoire moderne', 'Géographie humaine', 'Méthodologie']
    },
    {
      id: 6,
      firstName: 'Camille',
      lastName: 'Moreau',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      subjects: ['SVT', 'Chimie'],
      levels: ['Lycée'],
      languages: ['Français'],
      rating: 4.8,
      totalRatings: 112,
      students: 41,
      experience: 7,
      hourlyRate: 24,
      availability: ['Mardi', 'Jeudi', 'Samedi'],
      bio: 'Professeure de SVT et chimie avec une approche expérimentale. Cours interactifs et pratiques.',
      education: ['Master en Biologie', 'CAPES'],
      location: 'Bordeaux',
      isOnline: false,
      isVerified: true,
      specializations: ['Biologie cellulaire', 'Génétique', 'Chimie organique']
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadTeachers = async () => {
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        setTeachers(mockTeachers);
        setLoading(false);
      }, 1000);
    };

    loadTeachers();
  }, []);

  // Filter and sort teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubject = !filters.subject || teacher.subjects.includes(filters.subject);
    const matchesLevel = !filters.level || teacher.levels.includes(filters.level);
    const matchesLanguage = !filters.language || teacher.languages.includes(filters.language);
    const matchesRating = !filters.rating || teacher.rating >= parseFloat(filters.rating);
    const matchesPrice = !filters.priceRange || teacher.hourlyRate <= parseFloat(filters.priceRange);

    return matchesSearch && matchesSubject && matchesLevel && matchesLanguage && matchesRating && matchesPrice;
  });

  // Sort teachers
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'experience':
        comparison = a.experience - b.experience;
        break;
      case 'price':
        comparison = a.hourlyRate - b.hourlyRate;
        break;
      case 'students':
        comparison = a.students - b.students;
        break;
      default:
        comparison = a.rating - b.rating;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Pagination
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = sortedTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);
  const totalPages = Math.ceil(sortedTeachers.length / teachersPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      level: '',
      language: '',
      availability: '',
      rating: '',
      priceRange: ''
    });
    setSearchTerm('');
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Nos Enseignants
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Découvrez nos professeurs qualifiés et expérimentés
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sortedTeachers.length} enseignant{sortedTeachers.length > 1 ? 's' : ''} trouvé{sortedTeachers.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un enseignant, une matière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FaFilter />
              <span>Filtres</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating-desc">Note (plus haute)</option>
                <option value="rating-asc">Note (plus basse)</option>
                <option value="experience-desc">Expérience (plus haute)</option>
                <option value="experience-asc">Expérience (plus basse)</option>
                <option value="price-asc">Prix (plus bas)</option>
                <option value="price-desc">Prix (plus haut)</option>
                <option value="students-desc">Étudiants (plus nombreux)</option>
              </select>
              </div>
            </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Subject Filter */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matière
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters({...filters, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Toutes les matières</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique</option>
                    <option value="Chimie">Chimie</option>
                    <option value="Français">Français</option>
                    <option value="Anglais">Anglais</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Géographie">Géographie</option>
                    <option value="SVT">SVT</option>
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau
                  </label>
              <select
                    value={filters.level}
                    onChange={(e) => setFilters({...filters, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="Primaire">Primaire</option>
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                    <option value="Supérieur">Supérieur</option>
              </select>
            </div>

                {/* Language Filter */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Langue
                  </label>
              <select
                    value={filters.language}
                    onChange={(e) => setFilters({...filters, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Toutes les langues</option>
                    <option value="Français">Français</option>
                    <option value="Anglais">Anglais</option>
                    <option value="Espagnol">Espagnol</option>
              </select>
            </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note minimum
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Toutes les notes</option>
                    <option value="4.5">4.5+ étoiles</option>
                    <option value="4.0">4.0+ étoiles</option>
                    <option value="3.5">3.5+ étoiles</option>
                  </select>
          </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix maximum
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Tous les prix</option>
                    <option value="15">15€/h max</option>
                    <option value="20">20€/h max</option>
                    <option value="25">25€/h max</option>
                    <option value="30">30€/h max</option>
                  </select>
        </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    Effacer les filtres
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              {/* Teacher Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
              <div className="relative">
                <img
                      src={teacher.avatar} 
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {teacher.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    {teacher.isVerified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaEye className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {teacher.subjects.join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <FaStar className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{teacher.rating}</span>
                        <span className="text-sm text-gray-500">({teacher.totalRatings})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaGraduationCap className="w-4 h-4" />
                    <span>{teacher.experience} ans d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaUsers className="w-4 h-4" />
                    <span>{teacher.students} étudiants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span>{teacher.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaClock className="w-4 h-4" />
                    <span>{teacher.availability.join(', ')}</span>
                  </div>
                </div>

                {/* Specializations */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Spécialisations:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.specializations.slice(0, 3).map((spec, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {spec}
                    </span>
                  ))}
                    {teacher.specializations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{teacher.specializations.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {teacher.bio}
                </p>

                {/* Price and Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {teacher.hourlyRate}€/h
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                  <Link
                      to={`/teacher/${teacher.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                      Voir profil
                  </Link>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <FaHeart className="w-4 h-4" />
                  </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Suivant
            </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default Instructors; 