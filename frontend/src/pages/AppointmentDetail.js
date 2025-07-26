import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import './index.css';
import { appointmentService } from '../services/api';
import Loader from '../components/common/Loader';
import ChatInterface from '../components/chatbot/ChatInterface';

function AppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentService.getById(id);
        setAppointment(response.data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await appointmentService.update(id, {
        ...appointment,
        status: newStatus
      });
      setAppointment({
        ...appointment,
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!appointment) return <p className="text-gray-500 text-center">Appointment not found</p>;

  const { doctor, patient, dateTime, status, reason, notes } = appointment;
  const formattedDate = format(new Date(dateTime), 'PPP');
  const formattedTime = format(new Date(dateTime), 'p');

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary-700 p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Appointment Details</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100'}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                  <p className="text-lg font-medium">{doctor?.user?.name || 'Not assigned'}</p>
                  {doctor?.specialty && <p className="text-gray-600">{doctor.specialty}</p>}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                  <p className="text-lg font-medium">{patient?.user?.name || 'Not assigned'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-lg">{formattedDate}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="text-lg">{formattedTime}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">Reason for Visit</h3>
                <p className="text-lg">{reason}</p>
              </div>

              {notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="text-lg">{notes}</p>
                </div>
              )}

              <div className="flex space-x-4">
                {status === 'scheduled' && (
                  <>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleStatusChange('completed')}
                      disabled={updating}
                    >
                      Mark as Completed
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={updating}
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
                {status === 'cancelled' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleStatusChange('scheduled')}
                    disabled={updating}
                  >
                    Reschedule
                  </button>
                )}
                <button 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/')}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ChatInterface appointmentId={id} />
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetail;