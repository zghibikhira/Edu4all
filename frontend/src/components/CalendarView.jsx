import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/sessions`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formatted = data.sessions.map((session) => ({
            id: session._id,
            title: session.title,
            start: session.date,
            backgroundColor: session.status === 'scheduled' ? '#4CAF50' : '#F44336',
            extendedProps: { ...session },
          }));
          setEvents(formatted);
        }
      });
  }, []);

  const handleEventClick = (info) => {
    setSelectedSession(info.event.extendedProps);
    setModalOpen(true);
  };

  const handleJoin = async () => {
    if (!selectedSession) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/join/${selectedSession._id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.link) {
        window.open(data.link, '_blank');
      } else {
        alert('Could not join session.');
      }
    } catch (err) {
      alert('Error joining session.');
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Session Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        eventClick={handleEventClick}
      />
      {modalOpen && selectedSession && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setModalOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">{selectedSession.title}</h3>
            <p className="mb-1"><b>Date:</b> {new Date(selectedSession.date).toLocaleString()}</p>
            <p className="mb-1"><b>Duration:</b> {selectedSession.duration} min</p>
            <p className="mb-1"><b>Status:</b> {selectedSession.status}</p>
            <p className="mb-3"><b>Teacher:</b> {selectedSession.teacherId?.name || 'N/A'}</p>
            <button
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              onClick={handleJoin}
            >
              Join Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
