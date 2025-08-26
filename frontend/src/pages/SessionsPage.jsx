import React, { useState, useEffect } from 'react';

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    link: ''
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    // Fetch sessions
    fetch('/api/sessions', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        // Ensure sessions is always an array
        const sessionsData = data.data?.sessions || data.sessions || data || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      })
      .catch(err => {
        console.error(err);
        setSessions([]);
      });
  }, []);

  // Only show sessions for the current teacher
  const mySessions = user && Array.isArray(sessions) ? sessions.filter(s => (s.teacherId?._id || s.teacherId) === user._id) : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(newSession => {
        setSessions([...sessions, newSession.session || newSession]);
        setForm({ title: '', description: '', date: '', link: '' });
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Mes sessions</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input name="title" className="w-full border rounded px-3 py-2" placeholder="Titre" value={form.title} onChange={handleChange} required />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Lien Jitsi/Zoom</label>
            <input name="link" className="w-full border rounded px-3 py-2" placeholder="Lien Jitsi/Zoom" value={form.link} onChange={handleChange} />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" className="w-full border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={handleChange} />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Date et heure</label>
            <input type="datetime-local" name="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={handleChange} required />
          </div>
          <div className="col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Valider</button>
          </div>
        </form>
      </div>
      <div>
        {mySessions.length === 0 ? (
          <p className="text-gray-500">Aucune session disponible.</p>
        ) : (
          <div className="space-y-4">
            {mySessions.map((session) => (
              <div key={session._id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold text-lg">{session.title}</div>
                  <div className="text-gray-600 text-sm mb-1">{session.description}</div>
                </div>
                <div className="flex flex-col md:items-end md:space-x-4 md:flex-row mt-2 md:mt-0">
                  <div className="text-gray-700 text-sm mb-2 md:mb-0 md:mr-4">
                    {session.date ? new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + new Date(session.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                  {session.link && (
                    <a href={session.link} target="_blank" rel="noopener noreferrer">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Rejoindre</button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionsPage;
