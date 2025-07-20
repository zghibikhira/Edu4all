import React, { useState, useEffect } from 'react';
import { statsAPI } from '../utils/api';
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaBookOpen,
  FaVideo,
  FaStar,
  FaChartLine
} from 'react-icons/fa';

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await statsAPI.getGlobalStats();
        setStats(response.data.data.stats);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Erreur stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Statistiques par défaut si l'API n'est pas disponible
  const defaultStats = {
    totalUsers: 1250,
    totalStudents: 980,
    totalTeachers: 270,
    totalCourses: 450,
    totalSessions: 1200,
    totalRevenue: 25000
  };

  const currentStats = stats || defaultStats;

  const statsData = [
    {
      icon: <FaUsers className="text-4xl text-blue-500" />,
      title: "Utilisateurs",
      value: currentStats.totalUsers?.toLocaleString() || "0",
      description: "Membres actifs",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-600"
    },
    {
      icon: <FaGraduationCap className="text-4xl text-green-500" />,
      title: "Étudiants",
      value: currentStats.totalStudents?.toLocaleString() || "0",
      description: "Apprenants inscrits",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-600"
    },
    {
      icon: <FaChalkboardTeacher className="text-4xl text-purple-500" />,
      title: "Enseignants",
      value: currentStats.totalTeachers?.toLocaleString() || "0",
      description: "Professeurs certifiés",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-600"
    },
    {
      icon: <FaBookOpen className="text-4xl text-orange-500" />,
      title: "Cours",
      value: currentStats.totalCourses?.toLocaleString() || "0",
      description: "Cours disponibles",
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-600"
    },
    {
      icon: <FaVideo className="text-4xl text-red-500" />,
      title: "Sessions",
      value: currentStats.totalSessions?.toLocaleString() || "0",
      description: "Sessions réalisées",
      color: "bg-red-50 border-red-200",
      textColor: "text-red-600"
    },
    {
      icon: <FaStar className="text-4xl text-yellow-500" />,
      title: "Satisfaction",
      value: "4.8/5",
      description: "Note moyenne",
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-600"
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Notre Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les chiffres qui témoignent de notre engagement pour l'éducation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 animate-pulse">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Notre Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les chiffres qui témoignent de notre engagement pour l'éducation
          </p>
        </div>

        {/* Grille de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {statsData.map((stat, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-6 shadow-lg border-2 ${stat.color} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {stat.title}
                </h3>
                <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Section de croissance */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Croissance Continue
              </h3>
              <p className="text-gray-600 mb-6">
                Notre plateforme ne cesse de grandir, connectant de plus en plus d'étudiants 
                et d'enseignants passionnés. Rejoignez notre communauté éducative en pleine expansion.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FaChartLine className="text-green-500 text-xl mr-2" />
                  <span className="text-green-600 font-semibold">+25%</span>
                  <span className="text-gray-600 ml-1">ce mois</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-blue-500 text-xl mr-2" />
                  <span className="text-blue-600 font-semibold">+150</span>
                  <span className="text-gray-600 ml-1">nouveaux membres</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-4">Rejoignez-nous</h4>
              <p className="mb-4">
                Faites partie de cette aventure éducative et contribuez à l'avenir de l'apprentissage.
              </p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Commencer maintenant
              </button>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-2">
                Les statistiques affichées sont des données d'exemple
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection; 