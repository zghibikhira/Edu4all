import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 z-30 border-b border-gray-100 dark:border-gray-700">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        Passer au contenu principal
      </a>
      
      <div className="container-responsive flex items-center justify-between py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="inline-block w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus-ring"
            aria-label="Accueil Edu4All"
          >
            E4A
          </Link>
          <span className="font-poppins text-xl font-bold text-primary dark:text-primary-light">
            Edu4All
          </span>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-8 font-inter text-base" role="navigation" aria-label="Navigation principale">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/about" className="nav-link">À propos</Link>
          <Link to="/courses" className="nav-link">Cours</Link>
          <Link to="/instructors" className="nav-link">Enseignants</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          
          {/* Show Feed for logged-in students */}
          {user && user.role === 'etudiant' && (
            <Link to="/feed" className="nav-link">Fil d'actualité</Link>
          )}
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle className="hidden sm:flex" />
          
          {user ? (
            <>
              <NotificationBell />
              <Link 
                to="/dashboard" 
                className="btn-primary hidden md:inline-block"
                aria-label="Accéder au tableau de bord"
              >
                Tableau de bord
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="btn-secondary hidden md:inline-block"
                aria-label="Se déconnecter"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn-secondary hidden md:inline-block"
                aria-label="Se connecter"
              >
                Connexion
              </Link>
              <Link 
                to="/register" 
                className="btn-primary hidden md:inline-block"
                aria-label="S'inscrire"
              >
                Inscription
              </Link>
            </>
          )}
          
          {/* Mobile menu button */}
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 focus-ring"
            aria-label="Ouvrir le menu"
            aria-expanded="false"
            aria-controls="mobile-menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
