import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './index.css';
import { useAuth } from '../contexts/AuthContext';

function AppointmentForm() {
  const [doctor, setDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock doctors data
  useEffect(() => {
    // Simulate API call to fetch doctors
    setTimeout(() => {
      const mockDoctors = [
        { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology' },
        { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Dermatology' },
        { id: 3, name: 'Dr. Michael Brown', specialty: 'Neurology' },
        { id: 4, name: 'Dr. Emily Wilson', specialty: 'Family Medicine' },
        { id: 5, name: 'Dr. Robert Chen', specialty: 'Orthopedics' }
      ];
      setDoctors(mockDoctors);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!doctor || !date || !time || !reason) {
      setError('All fields are required');
      return;
    }
    
    // Get doctor name for the appointment record
    const selectedDoctor = doctors.find(doc => doc.id === parseInt(doctor));
    const doctorName = selectedDoctor ? selectedDoctor.name : 'Unknown Doctor';
    
    // Create appointment
    const appointment = {
      id: Date.now(),
      doctorId: doctor,
      doctorName,
      date,
      time,
      reason,
      patientId: user.email,
      patientName: user.name,
      status: 'scheduled'
    };
    
    // Save appointment to local storage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    alert('Appointment scheduled successfully!');
    navigate('/');
  };

  const formatDateTime = () => {
    if (!date || !time) return '';
    
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <div className="page-content">
      <h1 className="page-heading">Schedule Appointment</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form" style={{maxWidth: '600px'}}>
        <div className="form-group">
          <label htmlFor="doctor">Doctor</label>
          {loading ? (
            <div className="loading-message">Loading doctors...</div>
          ) : doctors.length > 0 ? (
            <select
              id="doctor"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              required
              className="input-field"
            >
              <option value="">-- Select a doctor --</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialty})
                </option>
              ))}
            </select>
          ) : (
            <div className="error-message">Failed to load doctors</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">Time</label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="input-field"
          />
        </div>
        
        {date && time && (
          <div className="selected-datetime">
            {formatDateTime()}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="reason">Reason for visit</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="input-field"
            rows="4"
            placeholder="Describe your symptoms or reason for appointment"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Schedule Appointment
          </button>
          <Link to="/" className="cancel-link">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default AppointmentForm;