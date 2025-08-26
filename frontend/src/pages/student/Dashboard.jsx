import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StudentRatings from '../../components/StudentRatings';
import { 
  FaUser, 
  FaBook, 
  FaCalendar, 
  FaWallet, 
  FaUpload, 
  FaSearch, 
  FaStar,
  FaComment, 
  FaExclamationTriangle,
  FaHistory,
  FaComments,
  FaPlus,
  FaFilter,
  FaClock,
  FaEuroSign,
  FaHeart,
  FaShare,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBell,
  FaCog,
  FaChartLine,
  FaGraduationCap,
  FaUsers,
  FaFileAlt,
  FaVideo,
  FaImage,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaPaperPlane,
  FaAward,
  FaHandPaper,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaUserMinus,
  FaUserCheck,
  FaUserPlus,
  FaDesktop,
  FaPencilAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaSave,
  FaExpand,
  FaCompress,
  FaStop,
  FaPhoneSlash,
  FaPhone,
  
  FaEllipsisH,
  FaLock,
  FaUnlock,
  FaDownload,
  FaCamera,
  FaVolumeUp,
  FaVolumeMute,
  
  
  FaSmile,
  FaFile,
  
  FaFlag,
  FaThumbsUp,
  FaReply,
  FaEye,
  FaBookmark
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [teacherPosts, setTeacherPosts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (user && isAuthenticated) {
      loadDashboardData();
    }
  }, [user, isAuthenticated]);

    const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données
      await Promise.all([
        loadTeachers(),
        loadEvaluations(),
        loadPurchases(),
        loadWalletData(),
        loadUpcomingMeetings(),
        loadTeacherPosts(),
        loadComplaints(),
        loadChatMessages()
      ]);
      } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
        setLoading(false);
      }
    };

  const loadTeachers = async () => {
    // Mock data pour les enseignants
    setTeachers([
      {
        _id: '1',
        firstName: 'Marie',
        lastName: 'Dubois',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        subjects: ['Mathématiques', 'Physique'],
        level: 'Lycée',
        rating: 4.8,
        hourlyRate: 45,
        isOnline: true,
        followers: 1250,
        posts: 23
      },
      {
        _id: '2',
        firstName: 'Jean',
        lastName: 'Martin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        subjects: ['Histoire', 'Géographie'],
        level: 'Collège',
        rating: 4.6,
        hourlyRate: 35,
        isOnline: false,
        followers: 890,
        posts: 15
      },
      {
        _id: '3',
        firstName: 'Sophie',
        lastName: 'Bernard',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        subjects: ['Anglais', 'Espagnol'],
        level: 'Tous niveaux',
        rating: 4.9,
        hourlyRate: 50,
        isOnline: true,
        followers: 2100,
        posts: 45
      }
    ]);
  };

  const loadEvaluations = async () => {
    setEvaluations([
      {
        _id: '1',
        title: 'Devoir de Mathématiques',
        subject: 'Mathématiques',
        teacher: 'Marie Dubois',
        grade: 85,
        maxGrade: 100,
        feedback: 'Excellent travail ! Continuez comme ça.',
        date: '2024-01-15',
        status: 'completed'
      },
      {
        _id: '2',
        title: 'Contrôle d\'Histoire',
        subject: 'Histoire',
        teacher: 'Jean Martin',
        grade: 78,
        maxGrade: 100,
        feedback: 'Bon travail, quelques erreurs de dates à corriger.',
        date: '2024-01-10',
        status: 'completed'
      }
    ]);
  };

  const loadPurchases = async () => {
    setPurchases([
      {
        _id: '1',
        courseTitle: 'Cours de Mathématiques Avancées',
        teacher: 'Marie Dubois',
        price: 29.99,
        purchaseDate: '2024-01-05',
        status: 'completed',
        files: ['cours_math.pdf', 'exercices.pdf']
      },
      {
        _id: '2',
        courseTitle: 'Méthodologie Histoire',
        teacher: 'Jean Martin',
        price: 19.99,
        purchaseDate: '2024-01-02',
        status: 'completed',
        files: ['methodologie_histoire.pdf']
      }
    ]);
  };

  const loadWalletData = async () => {
    setWalletBalance(125.50);
  };

  const loadUpcomingMeetings = async () => {
    setUpcomingMeetings([
      {
        _id: '1',
        teacher: 'Marie Dubois',
        subject: 'Mathématiques',
        date: '2024-01-20',
        time: '14:00',
        duration: 60,
        price: 45,
        status: 'confirmed'
      },
      {
        _id: '2',
        teacher: 'Sophie Bernard',
        subject: 'Anglais',
        date: '2024-01-22',
        time: '16:00',
        duration: 45,
        price: 50,
        status: 'pending'
      }
    ]);
  };

  const loadTeacherPosts = async () => {
    setTeacherPosts([
      {
        _id: '1',
        teacher: 'Marie Dubois',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        content: 'Nouveau cours disponible : Trigonométrie pour le lycée. Inscrivez-vous vite !',
        likes: 45,
        comments: 12,
        date: '2024-01-15',
        isLiked: false
      },
      {
        _id: '2',
        teacher: 'Sophie Bernard',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        content: 'Conseils pour améliorer votre prononciation en anglais. Vidéo disponible !',
        likes: 67,
        comments: 23,
        date: '2024-01-14',
        isLiked: true
      }
    ]);
  };

  const loadComplaints = async () => {
    setComplaints([
      {
        _id: '1',
        type: 'refund',
        subject: 'Demande de remboursement',
        description: 'Cours non conforme à la description',
        status: 'pending',
        date: '2024-01-12'
      }
    ]);
  };

  const loadChatMessages = async () => {
    setChatMessages([
      {
        _id: '1',
        sender: 'Marie Dubois',
        message: 'Bonjour ! Avez-vous des questions sur le cours ?',
        timestamp: '2024-01-15T10:30:00Z',
        isTeacher: true
      },
      {
        _id: '2',
        sender: 'Vous',
        message: 'Oui, j\'ai une question sur l\'exercice 3',
        timestamp: '2024-01-15T10:32:00Z',
        isTeacher: false
      }
    ]);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: FaChartLine },
    { id: 'evaluations', label: 'Mes Évaluations', icon: FaStar },
    { id: 'teachers', label: 'Enseignants', icon: FaUsers },
    { id: 'bookings', label: 'Réservations', icon: FaCalendar },
    { id: 'profile', label: 'Mon Profil', icon: FaUser },
    { id: 'uploads', label: 'Mes Fichiers', icon: FaUpload },
    { id: 'wallet', label: 'Mon Portefeuille', icon: FaWallet },
    { id: 'posts', label: 'Posts & Follows', icon: FaHeart },
    { id: 'complaints', label: 'Réclamations', icon: FaExclamationTriangle },
    { id: 'chat', label: 'Messages', icon: FaComments },
    { id: 'ratings', label: 'Noter enseignants/cours', icon: FaAward },
    { id: 'history', label: 'Historique', icon: FaHistory }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FaStar className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Moyenne</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4.7/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FaBook className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cours Achetés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FaCalendar className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingMeetings.length}</p>
            </div>
        </div>
      </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FaWallet className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{walletBalance}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaCalendar className="text-blue-600" />
            Prochaines Sessions
          </h3>
        </div>
        <div className="p-6">
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FaClock className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {meeting.teacher} - {meeting.subject}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(meeting.date).toLocaleDateString('fr-FR')} à {meeting.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {meeting.price}€
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {meeting.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Aucune session programmée
            </p>
          )}
        </div>
      </div>

      {/* Recent Teacher Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaHeart className="text-red-600" />
            Posts Récents des Enseignants
          </h3>
        </div>
        <div className="p-6">
          {teacherPosts.length > 0 ? (
            <div className="space-y-4">
              {teacherPosts.slice(0, 3).map((post) => (
                <div key={post._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={post.avatar} 
                      alt={post.teacher}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">{post.teacher}</p>
                        <span className="text-sm text-gray-500">{post.date}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className={`flex items-center gap-1 ${post.isLiked ? 'text-red-600' : 'hover:text-red-600'}`}>
                          <FaHeart className={post.isLiked ? 'fill-current' : ''} />
                          {post.likes}
                        </button>
                        <span className="flex items-center gap-1">
                          <FaComment />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Aucun post récent
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderEvaluations = () => (
    <div className="space-y-6">
            <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Évaluations</h2>
        <Link to="/evaluations" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Voir Toutes
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evaluations.map((evaluation) => (
          <div key={evaluation._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{evaluation.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{evaluation.subject} - {evaluation.teacher}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{evaluation.grade}/{evaluation.maxGrade}</div>
                <div className="text-sm text-gray-500">{evaluation.date}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(evaluation.grade / evaluation.maxGrade) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300">{evaluation.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );

    const renderTeachers = () => (
    <div className="space-y-6">
            <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Classement des Enseignants</h2>
        <div className="flex items-center gap-4">
          <Link to="/teacher-ranking" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Voir Classement Complet
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher, index) => (
          <div key={teacher._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header with Rank */}
            <div className="relative">
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20">
                  {index < 3 ? (
                    <>
                      {index === 0 && <FaCrown className="w-4 h-4" />}
                      {index === 1 && <FaMedal className="w-4 h-4" />}
                      {index === 2 && <FaTrophy className="w-4 h-4" />}
                      Top {index + 1}
                    </>
                  ) : (
                    <>
                      <FaTrophy className="w-4 h-4" />
                      Prof
                    </>
                  )}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Note</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaUsers className="text-blue-500 w-4 h-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">{teacher.followers}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaEuroSign className="text-green-500 w-4 h-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">{teacher.hourlyRate}€</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Par heure</p>
                </div>
              </div>

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
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
            <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Réservations</h2>
        <div className="flex gap-2">
          <Link to="/slot-booking" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Réserver un Créneau
          </Link>
          <Link to="/video-sessions" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Sessions Vidéo
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Créneaux Disponibles</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Utilisez le bouton "Réserver un Créneau" pour voir les créneaux disponibles
          </p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Profil</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-6 mb-6">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500">Étudiant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Informations Personnelles</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Niveau</label>
                <input 
                  type="text" 
                  defaultValue="Lycée" 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Langues</label>
                <input 
                  type="text" 
                  defaultValue="Français, Anglais" 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Préférences</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matières Préférées</label>
                <input 
                  type="text" 
                  defaultValue="Mathématiques, Physique" 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget Max</label>
                <input 
                  type="number" 
                  defaultValue="50" 
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sauvegarder
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Annuler
          </button>
        </div>
      </div>
              </div>
  );

  const renderUploads = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Fichiers</h2>
        <Link to="/file-upload" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FaUpload className="inline mr-2" />
          Uploader un Fichier
            </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Glissez un fichier ici ou cliquez pour sélectionner</p>
            <p className="text-sm text-gray-500 mt-2">PDF, Images, Vidéos acceptés</p>
          </div>
        </div>
      </div>
              </div>
  );

  const renderWallet = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Portefeuille</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Solde Actuel</h3>
          <div className="text-3xl font-bold text-green-600 mb-4">{walletBalance}€</div>
          <Link to="/wallet" className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
            Recharger
            </Link>
              </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options de Recharge</h3>
          <div className="space-y-3">
            <Link to="/wallet" className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
              Stripe
            </Link>
            <Link to="/wallet" className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
              PayPal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Posts & Follows</h2>
        <Link to="/followers-posts" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Voir Tous les Posts
        </Link>
        </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Posts des Enseignants Suivis</h3>
                    </div>
        <div className="p-6">
          {teacherPosts.map((post) => (
            <div key={post._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <img 
                  src={post.avatar} 
                  alt={post.teacher}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">{post.teacher}</p>
                    <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className={`flex items-center gap-1 ${post.isLiked ? 'text-red-600' : 'hover:text-red-600'}`}>
                      <FaHeart className={post.isLiked ? 'fill-current' : ''} />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <FaComment />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-600">
                      <FaShare />
                      Partager
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
              </div>
  );

  const renderComplaints = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Réclamations & Modération</h2>
        <Link to="/complaints" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Nouvelle Réclamation
            </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{complaint.subject}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  complaint.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {complaint.status === 'pending' ? 'En attente' : 'Résolu'}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{complaint.description}</p>
              <p className="text-sm text-gray-500">{complaint.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h2>
        <Link to="/chat" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Ouvrir Chat Complet
            </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat avec les Enseignants</h3>
              </div>
        <div className="p-6">
          <div className="space-y-4 mb-4">
            {chatMessages.map((message) => (
              <div key={message._id} className={`flex ${message.isTeacher ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.isTeacher 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  <p className="text-sm font-medium mb-1">{message.sender}</p>
                  <p>{message.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tapez votre message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Envoyer
            </button>
          </div>
        </div>
      </div>
              </div>
  );

  const renderRatings = () => (
    <div className="space-y-6">
      <StudentRatings />
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Historique d'Achats</h2>
        <Link to="/purchase-history" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Voir Historique Complet
            </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {purchases.map((purchase) => (
            <div key={purchase._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{purchase.courseTitle}</h3>
                <span className="text-green-600 font-semibold">{purchase.price}€</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Enseignant: {purchase.teacher}</p>
              <p className="text-sm text-gray-500 mb-3">Acheté le {purchase.purchaseDate}</p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fichiers inclus:</span>
                {purchase.files.map((file, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {file}
                  </span>
                ))}
              </div>
              
                             <div className="mt-3 flex gap-2">
                 <Link to="/purchase-history" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                   Télécharger
                 </Link>
                 <Link to="/teacher-ratings" className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                   Évaluer
            </Link>
               </div>
            </div>
          ))}
        </div>
              </div>
              </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'evaluations':
        return renderEvaluations();
      case 'teachers':
        return renderTeachers();
      case 'bookings':
        return renderBookings();
      case 'profile':
        return renderProfile();
      case 'uploads':
        return renderUploads();
      case 'wallet':
        return renderWallet();
      case 'posts':
        return renderPosts();
      case 'complaints':
        return renderComplaints();
      case 'chat':
        return renderChat();
      case 'ratings':
        return renderRatings();
      case 'history':
        return renderHistory();
      default:
        return renderOverview();
    }
  };

  if (!user || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
              </div>
              </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Étudiant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bienvenue, {user.firstName} ! Gérez vos cours, évaluations et rendez-vous.
          </p>
              </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 