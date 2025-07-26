import React, { useState } from 'react';
import AppointmentCard from './AppointmentCard';
import Loader from '../common/Loader';

const AppointmentList = ({ appointments, loading, error }) => {
  const [filter, setFilter] = useState('all');

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error loading appointments: {error}</p>;
  if (!appointments?.length) return <p className="text-gray-500 text-center py-10">No appointments found.</p>;

  const filteredAppointments = 
    filter === 'all' 
      ? appointments 
      : appointments.filter(appointment => appointment.status === filter);

  return (
    <div>
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('scheduled')} 
          className={`px-4 py-2 rounded-md ${filter === 'scheduled' ? 'bg-primary-600 text-white' : 'bg-white'}`}
        >
          Scheduled
        </button>
        <button 
          onClick={() => setFilter('completed')} 
          className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-primary-600 text-white' : 'bg-white'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setFilter('cancelled')} 
          className={`px-4 py-2 rounded-md ${filter === 'cancelled' ? 'bg-primary-600 text-white' : 'bg-white'}`}
        >
          Cancelled
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map(appointment => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;