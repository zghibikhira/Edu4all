import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../../utils/api';
import { FaChartLine, FaTrophy, FaUsers, FaArrowUp, FaArrowDown, FaMinus, FaEye, FaCalculator } from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const TeacherEvolutionDashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherDetails, setShowTeacherDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, statsRes, historyRes] = await Promise.all([
        teacherAPI.getEvolutionLeaderboard({ period, limit: 20 }),
        teacherAPI.getEvolutionStats(),
        teacherAPI.getEvolutionHistory({ period, limit: 50 })
      ]);

      setLeaderboard(leaderboardRes.data.data || []);
      setStats(statsRes.data.data);
      setHistory(historyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching evolution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateEvolution = async (teacherId) => {
    try {
      await teacherAPI.calculateEvolution({ teacherId, period });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error calculating evolution:', error);
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

  const chartData = history.slice(0, 12).map(item => ({
    period: new Date(item.periodStart).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    averageScore: item.evolutionScore,
    teachers: 1
  }));

  const rankDistribution = leaderboard.reduce((acc, teacher) => {
    acc[teacher.rank] = (acc[teacher.rank] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(rankDistribution).map(([rank, count]) => ({
    name: rank,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard d'évolution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard d'Évolution des Enseignants</h1>
          <p className="text-gray-600">Surveillez et analysez la progression des enseignants sur la plateforme</p>
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
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enseignants Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                </div>
                <FaUsers className="text-blue-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Score Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageEvolutionScore.toFixed(1)}</p>
                </div>
                <FaChartLine className="text-green-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réalisations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAchievements}</p>
                </div>
                <FaTrophy className="text-yellow-500 text-2xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Objectifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                </div>
                <FaChartLine className="text-purple-500 text-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Evolution Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendance d'Évolution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rank Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Rangs</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Classement d'Évolution</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score d'Évolution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((teacher, index) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {teacher.teacherId?.avatar ? (
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={teacher.teacherId.avatar} 
                              alt="" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {teacher.teacherId?.firstName?.charAt(0)}{teacher.teacherId?.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.teacherId?.firstName} {teacher.teacherId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.teacherId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.evolutionScore.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankColor(teacher.rank)}`}>
                        {teacher.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {teacher.metrics?.averageRating?.toFixed(1) || '0.0'}/5
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {teacher.metrics?.completedSessions || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowTeacherDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleCalculateEvolution(teacher.teacherId._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Recalculer l'évolution"
                        >
                          <FaCalculator className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Details Modal */}
        {showTeacherDetails && selectedTeacher && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de l'Évolution - {selectedTeacher.teacherId.firstName} {selectedTeacher.teacherId.lastName}
                  </h3>
                  <button
                    onClick={() => setShowTeacherDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Métriques Principales</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Score d'Évolution:</span>
                        <span className="font-medium">{selectedTeacher.evolutionScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Note Moyenne:</span>
                        <span className="font-medium">{selectedTeacher.metrics?.averageRating?.toFixed(1) || '0.0'}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions Complétées:</span>
                        <span className="font-medium">{selectedTeacher.metrics?.completedSessions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux de Réussite:</span>
                        <span className="font-medium">{selectedTeacher.metrics?.sessionCompletion?.toFixed(1) || '0.0'}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Réalisations</h4>
                    {selectedTeacher.achievements?.length > 0 ? (
                      <div className="space-y-1 text-sm">
                        {selectedTeacher.achievements.slice(0, 3).map((achievement, index) => (
                          <div key={index} className="flex items-center">
                            <FaTrophy className="text-yellow-500 mr-2 text-xs" />
                            <span>{achievement.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucune réalisation</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleCalculateEvolution(selectedTeacher.teacherId._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Recalculer l'Évolution
                  </button>
                  <button
                    onClick={() => setShowTeacherDetails(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherEvolutionDashboard;
