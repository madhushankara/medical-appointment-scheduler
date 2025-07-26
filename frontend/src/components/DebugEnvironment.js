import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebugEnvironment = () => {
  const [envVars, setEnvVars] = useState({});
  const [apiTest, setApiTest] = useState({ status: 'pending', result: null });
  const [emailjsTest, setEmailjsTest] = useState({ status: 'pending', result: null });

  useEffect(() => {
    // Collect all React environment variables
    const reactVars = Object.keys(process.env)
      .filter(key => key.startsWith('REACT_APP_'))
      .reduce((obj, key) => {
        obj[key] = process.env[key] ? `${process.env[key].substring(0, 4)}...` : 'Not set';
        return obj;
      }, {});
      
    setEnvVars({
      nodeEnv: process.env.NODE_ENV,
      ...reactVars
    });
    
    // Test API connection
    const testApi = async () => {
      try {
        setApiTest({ status: 'loading', result: null });
        const response = await axios.get(process.env.REACT_APP_API_URL + '/health');
        setApiTest({ 
          status: 'success', 
          result: response.data 
        });
      } catch (error) {
        setApiTest({ 
          status: 'error', 
          result: error.message,
          details: error.response?.data || 'No response data'
        });
      }
    };
    
    testApi();
  }, []);

  return (
    <div className="debug-panel">
      <h2>Environment Debug Information</h2>
      
      <div className="env-vars">
        <h3>Environment Variables</h3>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
      
      <div className="api-test">
        <h3>API Connection Test</h3>
        <div className={`status ${apiTest.status === 'success' ? 'success' : apiTest.status === 'error' ? 'error' : ''}`}>
          Status: {apiTest.status}
        </div>
        {apiTest.result && (
          <pre>{JSON.stringify(apiTest.result, null, 2)}</pre>
        )}
      </div>
      
      <button 
        className="debug-button" 
        onClick={() => {
          localStorage.setItem('debugInfo', JSON.stringify({
            timestamp: new Date().toISOString(),
            environment: envVars,
            apiTest: apiTest
          }));
          alert('Debug info saved to localStorage');
        }}
      >
        Save Debug Info
      </button>
    </div>
  );
};

export default DebugEnvironment;
