import emailjs from '@emailjs/browser';

// Initialize with environment variables with hardcoded fallbacks for guaranteed operation
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'Zz0gh57bJE9NCCZsv';
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_780diqb';
const TEMPLATE_REGISTRATION = process.env.REACT_APP_EMAILJS_TEMPLATE_REGISTRATION || 'template_c23sb4o';
const TEMPLATE_APPOINTMENT = process.env.REACT_APP_EMAILJS_TEMPLATE_APPOINTMENT || 'template_w4wezob';

// Initialize EmailJS immediately with error handling
try {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully with key:', EMAILJS_PUBLIC_KEY.substring(0, 4) + '...');
} catch (err) {
  console.error('Failed to initialize EmailJS:', err);
}

/**
 * Send a registration confirmation email with improved error handling
 */
export const sendRegistrationEmail = async (name, email) => {
  try {
    // Validate input parameters
    if (!name || typeof name !== 'string') {
      console.error("Invalid name:", name);
      return false;
    }
    
    if (!email || !email.includes('@')) {
      console.error("Invalid email address:", email);
      return false;
    }
    
    const templateParams = {
      to_email: email,
      to_name: name,
      date: new Date().toLocaleDateString()
    };

    console.log(`Sending registration email to ${name} at ${email}`);
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_REGISTRATION, templateParams);
    console.log("Registration email sent successfully:", result.status);
    return true;
  } catch (error) {
    console.error("Failed to send registration email:", error);
    // Try with hardcoded values as fallback
    try {
      const fallbackParams = {
        to_email: email,
        to_name: name,
        date: new Date().toLocaleDateString() + " (Fallback Method)"
      };
      
      await emailjs.send('service_780diqb', 'template_c23sb4o', fallbackParams);
      console.log("Registration email sent using fallback method");
      return true;
    } catch (fallbackError) {
      console.error("Fallback email method also failed:", fallbackError);
      return false;
    }
  }
};

/**
 * Send an appointment confirmation email
 * @param {string} name - Patient's name 
 * @param {string} email - Patient's email
 * @param {string} doctorName - Doctor's name
 * @param {string} appointmentDate - Formatted appointment date and time
 * @param {string} reason - Reason for appointment
 */
export const sendAppointmentBookedEmail = async (name, email, doctorName, appointmentDate, reason) => {
  try {
    // Make sure email is valid
    if (!email || !email.includes('@')) {
      console.error("Invalid email address:", email);
      return false;
    }
    
    const templateParams = {
      to_email: email,  // This should be a valid email
      to_name: name,
      doctor_name: doctorName || 'Your doctor',
      appointment_date: appointmentDate || 'scheduled time',
      reason: reason || 'your appointment'
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_APPOINTMENT, templateParams);
    console.log("Appointment confirmation email sent successfully", result);
    return true;
  } catch (error) {
    console.error("Failed to send appointment confirmation email:", error);
    return false;
  }
};

/**
 * Multi-purpose function for canceled appointments
 * Uses the appointment booking template but with a cancellation message
 * @param {string} name - Patient's name
 * @param {string} email - Patient's email
 * @param {string} doctorName - Doctor's name
 * @param {string} appointmentDate - Formatted appointment date and time
 */
export const sendAppointmentCanceledEmail = async (name, email, doctorName, appointmentDate) => {
  try {
    // Make sure email is valid
    if (!email || !email.includes('@')) {
      console.error("Invalid email address:", email);
      return false;
    }
    
    // Reusing the appointment template with modification
    const templateParams = {
      to_email: email,  // This should be a valid email
      to_name: name,
      doctor_name: doctorName || 'your doctor',
      appointment_date: appointmentDate || 'scheduled time',
      reason: "APPOINTMENT CANCELED: This email confirms your appointment has been canceled successfully."
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_APPOINTMENT, templateParams);
    console.log("Appointment cancellation email sent successfully", result);
    return true;
  } catch (error) {
    console.error("Failed to send appointment cancellation email:", error);
    return false;
  }
};

/**
 * Login notification email - reusing registration template
 * @param {string} name - User's name
 * @param {string} email - User's email
 */
export const sendLoginEmail = async (name, email) => {
  try {
    // Make sure email is valid
    if (!email || !email.includes('@')) {
      console.error("Invalid email address:", email);
      return false;
    }
    
    const loginTime = new Date().toLocaleString();
    // Reuse registration template with modified text
    const templateParams = {
      to_email: email,  // This should be a valid email
      to_name: name,
      date: `LOGIN NOTIFICATION: You logged in on ${loginTime}`
    };

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_REGISTRATION, templateParams);
    console.log("Login email sent successfully", result);
    return true;
  } catch (error) {
    console.error("Failed to send login email:", error);
    return false;
  }
};