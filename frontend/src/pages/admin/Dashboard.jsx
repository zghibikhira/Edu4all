import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, complaintAPI, moderationAPI } from '../../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../utils/api';

const AdminDashboard = () => {
  const [globalStats, setGlobalStats] = useState(null);
  const [sessionsSeries, setSessionsSeries] = useState([]);
  const [topTeachers, setTopTeachers] = useState([]);
  const [latestComplaints, setLatestComplaints] = useState([]);
  const [activeBans, setActiveBans] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, modsRes, complaintsRes, sessionsRes, topRes, revenueRes] = await Promise.all([
          statsAPI.getGlobalStats(),
          moderationAPI.getModerationStats(),
          complaintAPI.getAdminComplaints({ page: 1, limit: 10 }),
          api.get('/sessions/admin/series?days=30'),
          api.get('/teachers/admin/ranking/list', { params: { limit: 5, sortBy: 'averageRating' } }),
          api.get('/payments/admin/revenue-summary')
        ]);
        setGlobalStats(statsRes.data.data.stats);
        setActiveBans(modsRes.data.data.activeActions || 0);
        setLatestComplaints(complaintsRes.data.data.complaints || []);
        setSessionsSeries(sessionsRes.data.data || []);
        setTopTeachers(topRes.data.data || []);
        setRevenue(revenueRes.data.data?.totalRevenue || 0);
        setCredits(revenueRes.data.data?.totalCredits || 0);
      } catch (e) {
        // Fallback: ignore errors for not-yet-implemented endpoints
      }
    };
    load();
  }, []);

  const kpis = [
    { label: 'Utilisateurs', value: (globalStats?.totalUsers || 0) },
    { label: 'Enseignants', value: (globalStats?.totalTeachers || 0) },
    { label: 'Étudiants', value: (globalStats?.totalStudents || 0) },
    { label: 'Bannissements actifs', value: activeBans },
    { label: 'Plaintes ouvertes', value: (globalStats?.openComplaints || 0) },
    { label: 'Sessions (7j)', value: (globalStats?.sessionsWeek || 0) },
    { label: 'Revenus', value: `${revenue.toFixed(2)} €` },
    { label: 'Crédits', value: `${credits.toFixed(2)} €` }
  ];

  const sessionsData = useMemo(() => (sessionsSeries || []).map(d => ({ date: d.date, sessions: d.count })), [sessionsSeries]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Bienvenue sur le tableau de bord administrateur.</p>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg shadow border">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Sessions par jour (30 derniers jours)</h3>
          {sessionsData.length === 0 ? (
            <div className="text-gray-500 text-center py-10">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-lg shadow border p-4">
          <h3 className="text-lg font-semibold mb-2">Top 5 enseignants (note)</h3>
          {topTeachers.length === 0 ? (
            <div className="text-gray-500 text-center py-10">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topTeachers.map(t => ({ name: t.name, rating: t.averageRating }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Latest complaints */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dernières plaintes</h3>
          <Link to="/admin/complaints" className="text-blue-600 hover:text-blue-800 text-sm">Voir tout</Link>
        </div>
        <div className="divide-y">
          {latestComplaints.map(c => (
            <div key={c._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-gray-500">{c.category} • {new Date(c.createdAt).toLocaleString('fr-FR')}</div>
              </div>
              <Link to="/admin/complaints" className="text-blue-600 hover:text-blue-800 text-sm">Examiner</Link>
            </div>
          ))}
          {latestComplaints.length === 0 && (
            <div className="p-6 text-center text-gray-500">Aucune plainte</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
          <h3 className="text-xl font-semibold mb-4">Gestion des plaintes</h3>
          <p className="text-gray-600 mb-4">Modérez les plaintes et gérez les actions de modération</p>
          <Link 
            to="/admin/complaints" 
            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Gérer les plaintes
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Classement enseignants</h3>
          <p className="text-gray-600 mb-4">Voir et recalculer le statut</p>
          <Link 
            to="/admin/teachers" 
            className="inline-block bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          >
            Ouvrir
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 