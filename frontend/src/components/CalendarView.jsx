import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useAuth } from '../contexts/AuthContext';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetch('http://localhost:5000/api/meetings')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((meeting) => ({
          id: meeting._id,
          title: meeting.status === 'available' ? 'Available' : 'Booked',
          start: meeting.date,
          backgroundColor: meeting.status === 'available' ? '#4CAF50' : '#F44336',
          extendedProps: { status: meeting.status },
        }));
        setEvents(formatted);
      });
  }, []);

  const handleEventClick = async (info) => {
    const event = info.event;
    if (event.extendedProps.status === 'available' && user && user.role === 'student') {
      if (window.confirm('Book this slot?')) {
        const res = await fetch(`http://localhost:5000/api/meetings/${event.id}/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user._id })
        });
        if (res.ok) {
          // Refresh events
          fetch('http://localhost:5000/api/meetings')
            .then((res) => res.json())
            .then((data) => {
              const formatted = data.map((meeting) => ({
                id: meeting._id,
                title: meeting.status === 'available' ? 'Available' : 'Booked',
                start: meeting.date,
                backgroundColor: meeting.status === 'available' ? '#4CAF50' : '#F44336',
                extendedProps: { status: meeting.status },
              }));
              setEvents(formatted);
            });
        } else {
          alert('Failed to book meeting.');
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Meeting Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        eventClick={handleEventClick}
      />
      <p className="mt-2 text-sm text-gray-500">Click on an available slot to book it.</p>
    </div>
  );
};

export default CalendarView;
