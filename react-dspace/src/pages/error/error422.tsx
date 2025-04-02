import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";


const Error422 = () => {
  
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 100);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  const getCardStyle = () => {
    return {
      maxWidth: '500px', 
      width: '100%',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      zIndex: 1
    };
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" 
         style={{background: 'linear-gradient(to right, #93c5fd, #3b82f6)'}}>
      <div className="bg-white p-5 rounded shadow-lg text-center" style={getCardStyle()}>
        
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            background: `radial-gradient(circle at ${50 + Math.sin(animationPhase * 0.1) * 40}% ${50 + Math.cos(animationPhase * 0.1) * 40}%, rgba(167, 139, 250, 0.15), rgba(96, 165, 250, 0.05))`,
            opacity: 0.7,
            transition: 'background 0.5s ease'
          }}
        />
        
        
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: 10 + i * 5,
              height: 10 + i * 5,
              borderRadius: '50%',
              background: 'rgba(167, 139, 250, 0.2)',
              top: `${(Math.sin(animationPhase * 0.03 + i) * 0.5 + 0.5) * 100}%`,
              left: `${(Math.cos(animationPhase * 0.05 + i) * 0.5 + 0.5) * 100}%`,
              zIndex: -1,
              transition: 'all 0.5s ease'
            }}
          />
        ))}
        
        paramErrorCode && <h1 className="display-1 fw-bold mb-4" 
            style={{
              background: 'linear-gradient(to right, #a78bfa, #60a5fa)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent' 
            }}> 
           422
        </h1>
        <h2 className="h2 fw-bold text-secondary mb-4">OOPS! PAGE NOT FOUND</h2>
         <h5 className="text-secondary mb-4">
         'Not Found - The requested resource could not be found',
        </h5> 
        <div className="d-flex justify-content-center gap-3">
          <button onClick={() => navigate("/")} className="btn btn-primary px-4 py-2 rounded-pill">
            RETURN HOME
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-outline-primary px-4 py-2 rounded-pill">
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error422;