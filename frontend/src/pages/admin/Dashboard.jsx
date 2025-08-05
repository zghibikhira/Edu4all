import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
    <p className="text-gray-600 mb-8">Bienvenue sur le tableau de bord administrateur.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h3>
        <p className="text-gray-600 mb-4">Gérez les comptes utilisateurs et les rôles</p>
        <Link 
          to="/admin/users" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Gérer les utilisateurs
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Statistiques</h3>
        <p className="text-gray-600 mb-4">Consultez les statistiques de la plateforme</p>
        <div className="text-gray-500 text-sm">
          <p>Utilisateurs: 0</p>
          <p>Cours: 0</p>
          <p>Enseignants: 0</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Configuration</h3>
        <p className="text-gray-600 mb-4">Paramètres de la plateforme</p>
        <button className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
          Paramètres
        </button>
      </div>
    </div>
  </div>
);

export default AdminDashboard; 