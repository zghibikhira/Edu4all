import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  FaTachometerAlt, 
  FaVideo, 
  FaUser, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaComments, 
  FaWallet, 
  FaShoppingCart,
  FaHistory,
  FaStar,
  FaCalendarAlt,
  FaClipboardList,
  FaFileAlt,
  FaHome,
  FaBook,
  FaInfoCircle,
  FaEnvelope,
  FaBell,
  FaCog,
  FaTrendingUp,
  FaTrendingDown
} from 'react-icons/fa';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const { cart } = useCart();

  // Navigation sections
  const navigationSections = {
    main: [
      { label: 'Accueil', link: '/', icon: FaHome },
      { label: 'Cours', link: '/courses', icon: FaBook },
      { label: 'À propos', link: '/about', icon: FaInfoCircle },
      { label: 'Contact', link: '/contact', icon: FaEnvelope },
    ],
    student: user?.role === 'etudiant' ? [
      { label: 'Tableau de bord', link: '/dashboard', icon: FaTachometerAlt },
      { label: 'Mes évaluations', link: '/evaluations', icon: FaClipboardList },
      { label: 'Réservation meetings', link: '/meeting-reservation', icon: FaCalendarAlt },
      { label: 'Réserver créneaux', link: '/slot-booking', icon: FaCalendarAlt },
      { label: 'Sessions vidéo', link: '/video-sessions', icon: FaVideo },
      { label: 'Historique des achats', link: '/purchase-history', icon: FaHistory },
      { label: 'Évaluer les enseignants', link: '/teacher-ratings', icon: FaStar },
      { label: 'Mes documents', link: '/documents', icon: FaFileAlt },
    ] : [],
    teacher: user?.role === 'enseignant' ? [
      { label: 'Tableau de bord', link: '/teacher-dashboard', icon: FaTachometerAlt },
      { label: 'Gestion créneaux', link: '/teacher/slot-management', icon: FaCalendarAlt },
      { label: 'Sessions vidéo', link: '/teacher/video-sessions', icon: FaVideo },
      { label: 'Mon profil', link: '/teacher/profile', icon: FaUser },
      { label: 'Mon évolution', link: '/teacher/evolution', icon: FaChartLine },
    ] : [],
    admin: user?.role === 'admin' ? [
      { label: 'Tableau de bord', link: '/admin/dashboard', icon: FaTachometerAlt },
      { label: 'Gestion des plaintes', link: '/admin/complaints', icon: FaExclamationTriangle },
      { label: 'Évolution des enseignants', link: '/admin/teacher-evolution', icon: FaChartLine },
    ] : [],
    tools: user ? [
      { label: 'Chat', link: '/chat', icon: FaComments },
      { label: 'Wallet', link: '/wallet', icon: FaWallet },
      { label: 'Feed', link: '/feed', icon: FaComments },
      { label: 'Réclamations', link: '/complaints', icon: FaExclamationTriangle },
      { label: 'Notifications', link: '/notifications', icon: FaBell },
      { label: 'Paramètres', link: '/settings', icon: FaCog },
    ] : [],
  };

  return (
    <aside className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl z-40 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-block w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            E4A
          </Link>
          <div>
            <span className="font-poppins text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edu4All
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Plateforme éducative</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" 
          aria-label="Close menu"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-6 px-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              Navigation principale
            </h3>
            <div className="space-y-1">
              {navigationSections.main.map(item => (
                <Link 
                  key={item.label} 
                  to={item.link} 
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Role-specific Navigation */}
          {navigationSections.student.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                Espace étudiant
              </h3>
              <div className="space-y-1">
                {navigationSections.student.map(item => (
                  <Link 
                    key={item.label} 
                    to={item.link} 
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {navigationSections.teacher.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                Espace enseignant
              </h3>
              <div className="space-y-1">
                {navigationSections.teacher.map(item => (
                  <Link 
                    key={item.label} 
                    to={item.link} 
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {navigationSections.admin.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                Administration
              </h3>
              <div className="space-y-1">
                {navigationSections.admin.map(item => (
                  <Link 
                    key={item.label} 
                    to={item.link} 
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tools & Utilities */}
          {navigationSections.tools.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                Outils & Utilitaires
              </h3>
              <div className="space-y-1">
                {navigationSections.tools.map(item => (
                  <Link 
                    key={item.label} 
                    to={item.link} 
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer with Cart */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FaShoppingCart className="w-4 h-4 text-blue-600" />
            Mon panier
          </h3>
          {cart.length === 0 ? (
            <div className="text-center py-4">
              <FaShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <FaBook className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.title || item.name || 'Produit'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.price ? `${item.price}€` : 'Prix non disponible'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* User Info */}
        {user && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaUser className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role === 'etudiant' ? 'Étudiant' : user.role === 'enseignant' ? 'Enseignant' : 'Administrateur'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 