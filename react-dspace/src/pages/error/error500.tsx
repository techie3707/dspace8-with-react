import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Error500: React.FC = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setAnimate(true), 100);
  }, []);
  
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className={`text-center p-5 ${animate ? 'animate-in' : ''}`} 
           style={{
             opacity: animate ? 1 : 0,
             transform: animate ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.8s ease, transform 0.8s ease'
           }}>
        <div className="mb-4" 
             style={{
               animation: animate ? 'pulse 2s infinite' : 'none'
             }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#dc3545" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
            <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
          </svg>
        </div>
        
        <h1 className="display-1 fw-bold text-danger mb-3"
            style={{
              animation: animate ? 'pulse 2s infinite' : 'none'
            }}>
          500
        </h1>
        
        <div className="mx-auto mb-4" 
             style={{
               height: '4px',
               background: 'linear-gradient(90deg, transparent, #dc3545, transparent)',
               width: animate ? '80%' : '0%',
               transition: 'width 1.5s ease-out'
             }}>
        </div>
        
        <h2 className="mb-3 fs-1">Internal Server Error</h2>
        
        <p className="mb-4 fs-5 text-muted">
          Oops! Something went wrong on our end. Our team has been notified.
        </p>
        
        <button 
          className="btn btn-primary btn-lg px-4"
          onClick={() => window.location.reload()}
          style={{
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Refresh Page
        </button>
        
        <a href="/" 
           className="btn btn-outline-secondary btn-lg ms-3 px-4"
           style={{
             opacity: animate ? 1 : 0,
             transition: 'opacity 1s ease',
             transitionDelay: '0.5s'
           }}>
          Back to Home
        </a>
      </div>
    </div>
  );
};

// Add keyframes for pulse animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default Error500;