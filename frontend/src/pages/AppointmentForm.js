import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../contexts/AuthContext';
import { sendAppointmentBookedEmail } from '../services/emailService';

function AppointmentForm() {
  const [date, setDate] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      const mockDoctors = [
        { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology' },
        { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Dermatology' },
        { id: 3, name: 'Dr. Michael Brown', specialty: 'Neurology' },
        { id: 4, name: 'Dr. Emily Wilson', specialty: 'Family Medicine' },
        { id: 5, name: 'Dr. Robert Chen', specialty: 'Orthopedics' }
      ];
      setDoctors(mockDoctors);
      setFetchingDoctors(false);
    }, 1000);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find selected doctor's details
      const doctor = doctors.find(d => d.id === parseInt(selectedDoctor));
      const doctorName = doctor ? doctor.name : 'Unknown Doctor';
      
      // Format the date for better readability
      const formattedDate = date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      
      // Create appointment with user information
      const appointmentData = {
        id: Date.now(),
        doctor_id: parseInt(selectedDoctor),
        doctor_name: doctorName,
        patient_id: user?.id || Date.now(),
        patient_name: user?.name || 'Unknown Patient',
        patient_email: user?.email || 'no-email',
        date_time: date.toISOString(),
        formatted_date: formattedDate,
        duration: 30,
        reason: reason,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push(appointmentData);
      localStorage.setItem('appointments', JSON.stringify(appointments));
      
      // Send appointment confirmation email
      if (user && user.email) {
        try {
          await sendAppointmentBookedEmail(
            user.name,
            user.email,
            doctorName,
            formattedDate,
            reason
          );
        } catch (error) {
          console.error("Failed to send appointment confirmation email", error);
          // Don't block the appointment creation if email fails
        }
      }
      
      // Show success message
      alert('Appointment scheduled successfully!');
      navigate('/appointments');
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-container">
      <h2 className="page-heading">Schedule Appointment</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="doctor">Doctor</label>
          {fetchingDoctors ? (
            <p className="loading-message">Loading doctors...</p>
          ) : (
            <select
              id="doctor"
              className="input-field"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">-- Select a doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">Date & Time</label>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            timeCaption="Time"
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            className="input-field date-picker"
          />
        </div>

        {date && (
          <div className="selected-datetime">
            Selected date: {date.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="reason">Reason for visit</label>
          <textarea
            id="reason"
            className="input-field"
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Describe your symptoms or reason for appointment"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading || fetchingDoctors}
          >
            {loading ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
          <button 
            type="button" 
            className="cancel-button" 
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AppointmentForm;