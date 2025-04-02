import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Error400 = () => {
  // Animation states
  const [fadeIn, setFadeIn] = useState(false);
  const [bounce, setBounce] = useState(false);
  
  useEffect(() => {
    setFadeIn(true);
    
    const bounceTimer = setTimeout(() => {
      setBounce(true);
    }, 500);
    
    
    return () => clearTimeout(bounceTimer);
  }, []);

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div 
        className={`text-center p-5 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          transition: 'opacity 1s ease',
          maxWidth: '800px',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          background: 'white'
        }}
      >
        <div className="row mb-4">
          <div className="col">
            <div 
              className={bounce ? 'animate__animated animate__bounce' : ''}
              style={{ 
                fontSize: '8rem', 
                fontWeight: 'bold', 
                color: '#dc3545',
                animation: bounce ? 'bounce 1s' : 'none'
              }}
            >
              400
            </div>
            <h2 className="mb-4">Bad Request</h2>
            <p className="text-muted mb-4">
              Oops! The server couldn't understand your request due to invalid syntax.
            </p>
          </div>
        </div>
        
        <div className="row mb-4">
          <div className="col">
            <div className="border-top border-bottom py-4">
              <h4>What might have gone wrong?</h4>
              <ul className="list-unstyled text-start mx-auto" style={{ maxWidth: '400px' }}>
                <li className="mb-2">• Malformed request syntax</li>
                <li className="mb-2">• Invalid request message parameters</li>
                <li className="mb-2">• Deceptive request routing</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col d-flex justify-content-center gap-3">
            <a 
              href="/"
              className="btn btn-primary px-4 py-2"
              style={{ 
                transition: 'transform 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Go Home
            </a>
            <button 
              onClick={() => window.history.back()}
              className="btn btn-outline-secondary px-4 py-2"
              style={{ 
                transition: 'transform 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Go Back
            </button>
          </div>
        </div>
        
        
        <style>
          {`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-30px);
              }
              60% {
                transform: translateY(-15px);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Error400;