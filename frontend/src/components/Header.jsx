import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="w-full bg-white dark:bg-background-dark shadow-md fixed top-0 left-0 z-30">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-block w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">E4A</Link>
          <span className="font-poppins text-xl font-bold text-primary">Edu4All</span>
        </div>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-8 font-inter text-base">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/about" className="hover:text-primary">Pages</Link>
          <Link to="/courses" className="hover:text-primary">Courses</Link>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <Link to="/contact" className="hover:text-primary">Contact</Link>
          
          {/* Show Chat and Wallet for logged-in users */}
          {user && (
            <>
              <Link to="/chat" className="hover:text-primary">Chat</Link>
              <Link to="/wallet" className="hover:text-primary">Wallet</Link>
            </>
          )}
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary hidden md:inline-block">Dashboard</Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="btn-secondary hidden md:inline-block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary hidden md:inline-block">Login</Link>
              <Link to="/register" className="btn-primary hidden md:inline-block">Register</Link>
            </>
          )}
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded focus-ring" aria-label="Open menu">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
