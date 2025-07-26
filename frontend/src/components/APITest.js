import React, { useState, useEffect } from 'react';
import axios from 'axios';

const APITest = () => {
  const [status, setStatus] = useState('Checking connection...');
  const [response, setResponse] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test server root endpoint
        const rootResponse = await axios.get('http://localhost:8080/');
        console.log('Root endpoint response:', rootResponse.data);
        
        // Test API health endpoint
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('Health check response:', healthResponse.data);
        
        setStatus('Connected! API is working properly.');
        setResponse({
          root: rootResponse.data,
          health: healthResponse.data
        });
      } catch (error) {
        console.error('API connection error:', error);
        setStatus(`Connection error: ${error.message}`);
        
        if (error.code === 'ERR_NETWORK') {
          setStatus(`Network error: Make sure the backend server is running at ${API_URL}.`);
        } else if (error.response) {
          setResponse(error.response.data);
        }
      }
    };

    testConnection();
  }, [API_URL]);

  return (
    <div className="api-test">
      <h3>Backend API Connection Test</h3>
      <div className={`status ${status.includes('Connected') ? 'success' : 'error'}`}>
        {status}
      </div>
      
      {response && (
        <div className="api-response">
          <h4>Response Data:</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      
      <div className="api-endpoints">
        <h4>Available Endpoints:</h4>
        <ul>
          <li>Root: <code>http://localhost:8080/</code></li>
          <li>Health Check: <code>{API_URL}/health</code></li>
          <li>Auth/Login: <code>{API_URL}/auth/login</code></li>
          <li>Appointments: <code>{API_URL}/appointments</code></li>
        </ul>
      </div>
    </div>
  );
};

export default APITest;
