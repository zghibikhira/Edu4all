import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const { cart } = useCart();

  const menuItems = [
    { label: 'Home', link: '/' },
    { label: 'Pages', link: '/about' },
    { label: 'Courses', link: '/courses' },
    { label: 'Blog', link: '/blog' },
    { label: 'Contact', link: '/contact' },
  ];

  // Add Chat and Wallet for logged-in users
  if (user) {
    menuItems.push(
      { label: 'Chat', link: '/chat' },
      { label: 'Wallet', link: '/wallet' }
    );
  }

  return (
    <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-background-dark shadow-lg z-40 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 animate-slide-in`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-background-light/10">
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-block w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">E4A</Link>
          <span className="font-poppins text-lg font-bold text-primary">Edu4All</span>
        </div>
        <button onClick={onClose} className="p-2 rounded focus-ring" aria-label="Close menu">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <nav className="flex flex-col gap-2 mt-6 px-6">
        {menuItems.map(item => (
          <Link key={item.label} to={item.link} className="py-3 px-2 rounded-lg font-inter text-base hover:bg-primary/10 hover:text-primary transition-colors" onClick={onClose}>{item.label}</Link>
        ))}
      </nav>
      {/* Cart Section */}
      <div className="mt-8 px-6">
        <h3 className="font-bold text-lg mb-2 text-primary">My Basket</h3>
        {cart.length === 0 ? (
          <p className="text-gray-500 text-sm">Your basket is empty.</p>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {cart.map((item, idx) => (
              <li key={idx} className="bg-primary/5 rounded p-2 text-sm">
                {item.title || item.name || JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 