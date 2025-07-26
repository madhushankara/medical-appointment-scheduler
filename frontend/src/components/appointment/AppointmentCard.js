import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const AppointmentCard = ({ appointment }) => {
  const { id, doctor, patient, dateTime, status, reason } = appointment;
  const formattedDate = format(new Date(dateTime), 'PPP');
  const formattedTime = format(new Date(dateTime), 'p');

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{reason}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Doctor</p>
          <p className="font-medium">{doctor?.user?.name || 'Not assigned'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date & Time</p>
          <p className="font-medium">{formattedDate} at {formattedTime}</p>
        </div>
      </div>
      
      <Link 
        to={`/appointments/${id}`}
        className="btn btn-primary w-full text-center"
      >
        View Details
      </Link>
    </div>
  );
};

export default AppointmentCard;