import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DefineSlots = () => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('Available Slot');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    
    if (!user || !user._id) {
      setError('User not found. Please log in again.');
      return;
    }

    try {
      const dateTime = `${date}T${time}`;
      const res = await fetch('http://localhost:5000/api/meetings', {
        method: 'POST',
        body: JSON.stringify({ 
          date: dateTime, 
          teacherId: user._id, 
          title 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        setSuccess(true);
        setDate('');
        setTime('');
        setTitle('Available Slot');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to add slot');
      }
    } catch (err) {
      console.error('Error creating slot:', err);
      setError('Error connecting to server');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Définir un créneau de disponibilité</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Titre:</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            className="border rounded px-2 py-1 w-full" 
          />
        </div>
        <div>
          <label className="block mb-1">Date:</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
            className="border rounded px-2 py-1 w-full" 
          />
        </div>
        <div>
          <label className="block mb-1">Heure:</label>
          <input 
            type="time" 
            value={time} 
            onChange={e => setTime(e.target.value)} 
            required 
            className="border rounded px-2 py-1 w-full" 
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Ajouter le créneau
        </button>
      </form>
      {success && <div className="text-green-600 mt-2">Créneau ajouté avec succès !</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default DefineSlots; 