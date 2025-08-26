import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teacherAPI } from '../../utils/api';
import { FaChartLine, FaTrophy, FaBullseye, FaLightbulb, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const TeacherEvolution = () => {
  const { user } = useAuth();
  const [evolution, setEvolution] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('evolutionScore');

  useEffect(() => {
    fetchEvolution();
    fetchStats();
  }, [period]);

  const fetchEvolution = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getEvolution({ period, limit: 12 });
      setEvolution(response.data.data || []);
    } catch (error) {
      console.error('Error fetching evolution:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await teacherAPI.getEvolutionStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <FaArrowUp className="text-green-500" />;
      case 'decreasing':
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaMinus className="text-gray-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Master':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Expert':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Professional':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Apprentice':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const chartData = evolution.map(item => ({
    period: new Date(item.periodStart).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    evolutionScore: item.evolutionScore,
    averageRating: item.metrics.averageRating,
    sessionCompletion: item.metrics.sessionCompletion,
    revenue: item.metrics.totalRevenue,
    students: item.metrics.totalStudents
  })).reverse();

  const achievementData = evolution.flatMap(item => 
    item.achievements.map(achievement => ({
      name: achievement.title,
      value: 1,
      category: achievement.category
    }))
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!user || user.role !== 'enseignant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600">Seuls les enseignants peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'évolution...</p>
        </div>
      </div>
    );
  }

  const currentEvolution = evolution[0];
  const previousEvolution = evolution[1];

  const calculateImprovement = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Évolution</h1>
          <p className="text-gray-600">Suivez votre progression et vos performances au fil du temps</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Période:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>
            <button
              onClick={fetchEvolution}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Current Status */}
        {currentEvolution && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Score d'Évolution</p>
                  <p className="text-2xl font-bold text-gray-900">{currentEvolution.evolutionScore.toFixed(1)}</p>
                </div>
                <FaChartLine className="text-blue-500 text-2xl" />
              </div>
              {previousEvolution && (
                <div className="mt-2 flex items-center text-sm">
                  {getTrendIcon(calculateImprovement(currentEvolution.evolutionScore, previousEvolution.evolutionScore) > 0 ? 'increasing' : 'decreasing')}
                  <span className="ml-1">
                    {Math.abs(calculateImprovement(currentEvolution.evolutionScore, previousEvolution.evolutionScore)).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rang</p>
                  <p className="text-2xl font-bold text-gray-900">{currentEvolution.rank}</p>
                </div>
                <FaLightbulb className="text-yellow-500 text-2xl" />
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankColor(currentEvolution.rank)}`}>
                  {currentEvolution.rank}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{currentEvolution.metrics.averageRating.toFixed(1)}/5</p>
                </div>
                <FaTrophy className="text-green-500 text-2xl" />
              </div>
              <p className="text-sm text-gray-500 mt-1">{currentEvolution.metrics.totalRatings} avis</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions Complétées</p>
                  <p className="text-2xl font-bold text-gray-900">{currentEvolution.metrics.completedSessions}</p>
                </div>
                <FaBullseye className="text-purple-500 text-2xl" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {currentEvolution.metrics.sessionCompletion.toFixed(1)}% de réussite
              </p>
            </div>
          </div>
        )}

        {/* Evolution Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progression au fil du temps</h2>
          <div className="mb-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="evolutionScore">Score d'Évolution</option>
              <option value="averageRating">Note Moyenne</option>
              <option value="sessionCompletion">Taux de Réussite</option>
              <option value="revenue">Revenus</option>
              <option value="students">Nombre d'Étudiants</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Achievements Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Réalisations</h3>
            {achievementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={achievementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {achievementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune réalisation pour le moment
              </div>
            )}
          </div>
        </div>

        {/* Achievements and Goals */}
        {currentEvolution && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Achievements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Réalisations Récentes</h3>
              {currentEvolution.achievements.length > 0 ? (
                <div className="space-y-3">
                  {currentEvolution.achievements.slice(0, 5).map((achievement, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FaTrophy className="text-yellow-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune réalisation pour le moment</p>
              )}
            </div>

            {/* Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs</h3>
              {currentEvolution.goals.length > 0 ? (
                <div className="space-y-3">
                  {currentEvolution.goals.slice(0, 5).map((goal, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{goal.title}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                          goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Progression: {goal.current}/{goal.target}</span>
                        <span className="text-gray-500">
                          {goal.deadline && new Date(goal.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun objectif défini</p>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {currentEvolution && currentEvolution.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentEvolution.recommendations.map((recommendation, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recommendation.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recommendation.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {recommendation.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherEvolution;
