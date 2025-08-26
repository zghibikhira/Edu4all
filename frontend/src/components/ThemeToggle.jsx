import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';

const ThemeToggle = ({ className = '', showLabels = false }) => {
  const { theme, currentTheme, toggleTheme, setThemeMode } = useTheme();

  const themes = [
    { value: 'light', icon: FaSun, label: 'Mode clair' },
    { value: 'dark', icon: FaMoon, label: 'Mode sombre' },
    { value: 'auto', icon: FaDesktop, label: 'Automatique' }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabels && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Thème:
        </span>
      )}
      
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setThemeMode(value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${theme === value 
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800
            `}
            aria-label={`Activer le ${label}`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            {showLabels && <span>{label}</span>}
          </button>
        ))}
      </div>
      
      {/* Quick toggle button for mobile */}
      <button
        onClick={toggleTheme}
        className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label={`Basculer vers le ${currentTheme === 'light' ? 'mode sombre' : 'mode clair'}`}
      >
        {currentTheme === 'light' ? (
          <FaMoon className="w-5 h-5" />
        ) : (
          <FaSun className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
