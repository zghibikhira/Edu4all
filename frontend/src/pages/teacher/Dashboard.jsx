import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChatSummary from '../../components/ChatSummary';
import WalletSummary from '../../components/WalletSummary';
import PostForm from '../../components/PostForm';
import { teacherAPI } from '../../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TeacherDashboard = () => {
  const { user } = useAuth();
  // const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [ratings, setRatings] = useState({ distribution: [], average: 0 });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [interval, setInterval] = useState('month');
  const [showPostModal, setShowPostModal] = useState(false);
  const isTeacher = user?.role === 'enseignant';

  useEffect(() => {
    if (!isTeacher) return;
    const fetchAll = async () => {
      try {
        const qs = [];
        if (dateRange.from) qs.push(`from=${encodeURIComponent(dateRange.from)}`);
        if (dateRange.to) qs.push(`to=${encodeURIComponent(dateRange.to)}`);
        const query = qs.length ? `?${qs.join('&')}` : '';

        const [sRes, eRes, rRes] = await Promise.all([
          teacherAPI.getDashboardSummary(query),
          teacherAPI.getDashboardEarnings(interval),
          teacherAPI.getDashboardRatings()
        ]);
        setSummary(sRes.data.data);
        setEarnings(eRes.data.data);
        setRatings(rRes.data.data);
      } catch (e) {
        console.error('Error loading teacher dashboard:', e);
      }
    };
    fetchAll();
  }, [isTeacher, dateRange, interval]);

  const earningsSeries = useMemo(() => {
    return earnings.map(pt => ({ date: pt._id || pt.date, amount: pt.amount }));
  }, [earnings]);

  const ratingBars = useMemo(() => {
    return ratings.distribution.map(d => ({ rating: d._id, count: d.count }));
  }, [ratings]);

  const kpis = [
    { title: 'Revenus (période)', value: `${(summary?.totals?.earnings || 0).toFixed(2)} €`, icon: '💰', color: 'bg-orange-500' },
    { title: 'Sessions à venir', value: summary?.upcomingSessions?.length || 0, icon: '📅', color: 'bg-purple-500' },
    { title: 'Taux d\'annulation', value: `${Math.round((summary?.totals?.cancellationRate || 0) * 100)}%`, icon: '❌', color: 'bg-red-500' },
    { title: 'Note moyenne', value: (summary?.totals?.averageRating || 0).toFixed(1), icon: '⭐', color: 'bg-yellow-500' },
    { title: 'Avis récents', value: summary?.totals?.totalRatings || 0, icon: '📝', color: 'bg-blue-500' },
    { title: 'Plaintes (contre moi)', value: summary?.totals?.complaintCount || 0, icon: '🛡️', color: 'bg-rose-500' }
  ];

  const recentReviews = summary?.recentReviews || [];
  const upcomingSessions = summary?.upcomingSessions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord enseignant</h1>
              <p className="text-gray-600">Bienvenue, {user?.firstName} {user?.lastName} (Enseignant)</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange(r => ({ ...r, from: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                <span>→</span>
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange(r => ({ ...r, to: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
              </div>
              <select value={interval} onChange={(e) => setInterval(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Revenus dans le temps</h3>
            {earningsSeries.length === 0 ? (
              <div className="text-gray-500 text-center py-10">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={earningsSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
                  </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-2">Distribution des notes</h3>
            {ratingBars.length === 0 ? (
              <div className="text-gray-500 text-center py-10">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ratingBars}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Sessions à venir</h3>
              <Link to="/teacher/video-sessions" className="text-blue-600 hover:text-blue-800 text-sm">Créer une session</Link>
                          </div>
            {upcomingSessions.length === 0 ? (
              <div className="text-gray-500 text-center py-10">Aucune session planifiée</div>
            ) : (
              <div className="divide-y">
                {upcomingSessions.map(s => (
                  <div key={s._id} className="py-2 flex items-center justify-between">
                  <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-sm text-gray-500">{new Date(s.date).toLocaleString('fr-FR')}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">{s.status}</span>
                  </div>
                ))}
              </div>
            )}
                </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Avis récents</h3>
              <Link to="/teacher-ratings" className="text-blue-600 hover:text-blue-800 text-sm">Voir tous</Link>
                </div>
            {recentReviews.length === 0 ? (
              <div className="text-gray-500 text-center py-10">Aucun avis pour le moment</div>
            ) : (
              <div className="divide-y">
                {recentReviews.map(r => (
                  <div key={r._id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{r.student?.firstName} {r.student?.lastName}</div>
                      <div className="text-yellow-500">{'⭐'.repeat(Math.round(r.overallRating))}</div>
                    </div>
                    {r.comment && <div className="text-sm text-gray-600 mt-1">{r.comment}</div>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/teacher/video-sessions" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Créer une session</Link>
          <Link to="/wallet" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Retirer mes revenus</Link>
          <button 
            onClick={() => setShowPostModal(true)} 
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Écrire un post
          </button>
          <Link to="/preferences" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Préférences</Link>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/teacher/slot-management" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <span className="text-sm font-medium text-center">Créer les créneaux</span>
              <span className="text-xs text-gray-500 text-center">Définir disponibilités</span>
            </Link>
            
            <Link 
              to="/file-upload" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📹</span>
              </div>
              <span className="text-sm font-medium text-center">Upload de fichiers</span>
              <span className="text-xs text-gray-500 text-center">Vidéos et documents</span>
            </Link>
            
            <Link 
              to="/teacher/video-sessions" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">🎥</span>
              </div>
              <span className="text-sm font-medium text-center">Mes sessions</span>
              <span className="text-xs text-gray-500 text-center">Gérer les sessions</span>
            </Link>
            
            {/* Teacher ratings entry removed per request; ratings live under student dashboard now */}
          </div>
          
          {/* Second row of actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Link 
              to="/courses" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-sm font-medium text-center">Mes cours</span>
              <span className="text-xs text-gray-500 text-center">Gérer les cours</span>
            </Link>
            
            <Link 
              to="/evaluations" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📝</span>
              </div>
              <span className="text-sm font-medium text-center">Évaluations</span>
              <span className="text-xs text-gray-500 text-center">Créer évaluations</span>
            </Link>
            
            <Link 
              to="/calendar" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">🗓️</span>
              </div>
              <span className="text-sm font-medium text-center">Calendrier</span>
              <span className="text-xs text-gray-500 text-center">Voir planning</span>
            </Link>
            
            <button 
              onClick={() => setShowPostModal(true)}
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📝</span>
              </div>
              <span className="text-sm font-medium text-center">Créer un post</span>
              <span className="text-xs text-gray-500 text-center">Partager du contenu</span>
            </button>
          </div>
          
          {/* Third row of actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Link 
              to="/teacher/profile" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">👤</span>
              </div>
              <span className="text-sm font-medium text-center">Mon profil</span>
              <span className="text-xs text-gray-500 text-center">Gérer profil</span>
            </Link>
            
            <Link 
              to="/complaints" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">🛡️</span>
              </div>
              <span className="text-sm font-medium text-center">Mes plaintes</span>
              <span className="text-xs text-gray-500 text-center">Gérer plaintes</span>
            </Link>
            
            <Link 
              to="/file-upload" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">📁</span>
              </div>
              <span className="text-sm font-medium text-center">Fichiers</span>
              <span className="text-xs text-gray-500 text-center">Gérer fichiers</span>
            </Link>
            
            <Link 
              to="/preferences" 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">⚙️</span>
              </div>
              <span className="text-sm font-medium text-center">Préférences</span>
              <span className="text-xs text-gray-500 text-center">Paramètres</span>
            </Link>
          </div>
        </div>

        {/* Extras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <WalletSummary />
          <ChatSummary />
        </div>
      </div>

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Créer un nouveau post</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <PostForm 
              teacherId={user?.id}
              onPostCreated={(newPost) => {
                setShowPostModal(false);
                // Optionally refresh dashboard data
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard; 