import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { FaArrowUp, FaArrowDown, FaMinus, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudentEvolution = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/evaluations/stats', { params: { period } });
        setStats(res.data.data);
      } catch (e) {
        console.error('Error loading student evolution stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const trendIcon = useMemo(() => {
    if (!stats) return <FaMinus className="text-gray-400" />;
    if ((stats.published || 0) > (stats.graded || 0)) return <FaArrowUp className="text-green-500" />;
    if ((stats.published || 0) < (stats.graded || 0)) return <FaArrowDown className="text-red-500" />;
    return <FaMinus className="text-gray-400" />;
  }, [stats]);

  if (!user || user.role !== 'etudiant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès restreint</h2>
          <p className="text-gray-600">Cette page est réservée aux étudiants.</p>
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

  const series = [
    { name: 'Évaluations', value: stats?.total || 0, key: 'total' },
    { name: 'Soumises', value: stats?.submitted || 0, key: 'submitted' },
    { name: 'Corrigées', value: stats?.graded || 0, key: 'graded' },
    { name: 'Publiées', value: stats?.published || 0, key: 'published' }
  ];

  const chartData = [
    { label: 'Moyenne (%)', value: Math.round((stats?.averagePercentage || 0) * 10) / 10 },
    { label: 'Score moyen', value: Math.round((stats?.averageScore || 0) * 10) / 10 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-blue-600" /> Évolution de mes évaluations
          </h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {series.map((s) => (
            <div key={s.key} className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">{s.name}</div>
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border p-4 mb-8">
          <h3 className="text-lg font-semibold mb-2">Indicateurs</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Tendance récente {trendIcon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEvolution;


