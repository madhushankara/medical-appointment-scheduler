import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendAppointmentCanceledEmail } from '../services/emailService'; 

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load appointments from localStorage that belong to current user
    const loadAppointments = () => {
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      // Filter appointments for the current user
      const userAppointments = allAppointments.filter(
        appointment => appointment.patient_id === user?.id || appointment.patient_email === user?.email
      );
      setAppointments(userAppointments);
      setLoading(false);
    };

    loadAppointments();
  }, [user]);

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Get all appointments
        const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Find the appointment to be canceled
        const appointmentToCancel = allAppointments.find(appt => appt.id === appointmentId);
        
        if (!appointmentToCancel) {
          console.error("Appointment not found");
          return;
        }
        
        // Update the status of the appointment to be canceled
        const updatedAppointments = allAppointments.map(appointment => {
          if (appointment.id === appointmentId) {
            return { ...appointment, status: 'canceled' };
          }
          return appointment;
        });
        
        // Save back to localStorage
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        
        // Update the state to reflect changes
        setAppointments(appointments.map(appointment => {
          if (appointment.id === appointmentId) {
            return { ...appointment, status: 'canceled' };
          }
          return appointment;
        }));
        
        // Send cancellation email - reusing the appointment booked template
        if (user && user.email) {
          try {
            await sendAppointmentCanceledEmail(
              user.name,
              user.email,
              appointmentToCancel.doctor_name,
              appointmentToCancel.formatted_date || formatAppointmentDateTime(appointmentToCancel.date_time)
            );
          } catch (error) {
            console.error("Failed to send cancellation email", error);
            // Don't block the cancellation if email fails
          }
        }
      } catch (error) {
        console.error("Error canceling appointment", error);
        alert("There was a problem canceling your appointment. Please try again.");
      }
    }
  };

  const formatAppointmentDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Helper function to determine appointment status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'canceled': return 'status-canceled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="page-content">
      <h1 className="page-heading">My Appointments</h1>

      {loading ? (
        <p className="loading-message">Loading your appointments...</p>
      ) : appointments.length > 0 ? (
        <div className="appointments-list">
          {appointments.map(appointment => (
            <div 
              key={appointment.id} 
              className={`appointment-card ${appointment.status === 'canceled' ? 'appointment-canceled' : ''}`}
            >
              <div className="appointment-header">
                <h3>{appointment.doctor_name}</h3>
                <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status === 'scheduled' ? 'Upcoming' : 
                   appointment.status === 'canceled' ? 'Canceled' : 
                   appointment.status === 'completed' ? 'Completed' : appointment.status}
                </span>
              </div>
              
              <div className="appointment-details">
                <p><strong>Date & Time:</strong> {formatAppointmentDateTime(appointment.date_time)}</p>
                <p><strong>Reason:</strong> {appointment.reason}</p>
              </div>
              
              <div className="appointment-actions">
                {appointment.status === 'scheduled' && (
                  <button 
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="cancel-appointment-button"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You don't have any appointments yet.</p>
          <Link to="/appointments/new" className="primary-button">Schedule an Appointment</Link>
        </div>
      )}
    </div>
  );
}

export default MyAppointments;