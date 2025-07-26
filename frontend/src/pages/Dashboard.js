import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/api';
import AppointmentList from '../components/appointment/AppointmentList';
import ChatInterface from '../components/chatbot/ChatInterface';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentService.getAll();
        setAppointments(response.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Link to="/appointments/new" className="btn btn-primary">
          New Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AppointmentList 
            appointments={appointments} 
            loading={loading} 
            error={error} 
          />
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
            <p className="text-gray-600 mb-2">
              {user?.role === 'patient' 
                ? 'Schedule appointments with our doctors and get the care you need.'
                : 'Manage your appointments and patient schedule.'}
            </p>
          </div>
          
          <div className="sticky top-6">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;