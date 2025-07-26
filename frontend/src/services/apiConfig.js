// Use a specific production URL rather than relative path for cross-domain requests
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://medical-scheduler-api-75f2e5dbaf51.herokuapp.com/api'
  : 'http://localhost:8080/api';

console.log('API URL:', API_URL);

export default API_URL;
