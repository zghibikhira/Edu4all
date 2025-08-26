import React, { useEffect, useMemo, useState } from 'react';
import { teacherAPI } from '../../utils/api';

const TeachersRanking = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('averageRating');
  const [order, setOrder] = useState('desc');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [limit, setLimit] = useState(50);
  const [recomputing, setRecomputing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = { sortBy, order, limit };
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await teacherAPI.getAdminRanking(params);
      setRows(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sortBy, order, limit]);

  const handleRecompute = async () => {
    try {
      setRecomputing(true);
      await teacherAPI.recomputeAdminRanking();
      await load();
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Classement des enseignants</h1>
        <button onClick={handleRecompute} disabled={recomputing} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50">
          {recomputing ? 'Recalcul...' : 'Recalculer le classement'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Du</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Au</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Trier par</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="averageRating">Note moyenne</option>
              <option value="totalReviews"># avis</option>
              <option value="sessionsCompleted">Sessions complétées</option>
              <option value="cancellationRate">Taux d'annulation</option>
              <option value="disputeRate">Taux de litiges</option>
              <option value="revenue">Revenus</option>
              <option value="rank">Statut</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ordre</label>
            <select value={order} onChange={(e) => setOrder(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Limite</label>
            <input type="number" value={limit} onChange={(e) => setLimit(parseInt(e.target.value) || 50)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-end">
            <button onClick={load} className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Appliquer</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enseignant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avis</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions complétées</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annulation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Litiges</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={8}>Chargement...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6 text-gray-500" colSpan={8}>Aucune donnée</td></tr>
            ) : (
              rows.map(r => (
                <tr key={r.teacherId}>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${r.rank === 'Hyperprof' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : r.rank === 'Superprof' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>{r.rank}</span>
                  </td>
                  <td className="px-4 py-3">{r.averageRating?.toFixed?.(1) ?? r.averageRating}</td>
                  <td className="px-4 py-3">{r.totalReviews}</td>
                  <td className="px-4 py-3">{r.sessionsCompleted}</td>
                  <td className="px-4 py-3">{Math.round((r.cancellationRate || 0) * 100)}%</td>
                  <td className="px-4 py-3">{Math.round((r.disputeRate || 0) * 100)}%</td>
                  <td className="px-4 py-3">{(r.revenue || 0).toFixed(2)} €</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeachersRanking;


