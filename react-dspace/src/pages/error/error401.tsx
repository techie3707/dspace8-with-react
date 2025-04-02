import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ParticlePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface ParticleProps {
  id: number;
  color: string;
}

interface ParticleData {
  id: number;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ id, color }) => {
  const [position, setPosition] = useState<ParticlePosition>({
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: Math.random() * 0.3 - 0.15,
    vy: Math.random() * 0.3 - 0.15
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        
        // Bounce off edges
        if (newX < 0 || newX > 100) {
          newX = Math.max(0, Math.min(100, newX));
          return {
            ...prev,
            x: newX,
            vx: -prev.vx
          };
        }
        
        if (newY < 0 || newY > 100) {
          newY = Math.max(0, Math.min(100, newY));
          return {
            ...prev,
            y: newY,
            vy: -prev.vy
          };
        }
        
        return {
          ...prev,
          x: newX,
          y: newY
        };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="particle"
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0.7
      }}
    />
  );
};

const Error401: React.FC = () => {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const colors: string[] = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#5f27cd'];
  
  useEffect(() => {

    const newParticles: ParticleData[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setParticles(newParticles);
  }, []);

  const handleGoBack = (): void => {
    window.history.back();
  };

  const handleGoHome = (): void => {
    window.location.href = '/';
  };

  const handleGoToLogin = (): void => {
    window.location.href = '/login';
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden bg-dark">
      {particles.map(particle => (
        <Particle key={particle.id} id={particle.id} color={particle.color} />
      ))}
      
      <div className="container text-center position-relative">
        <div className="row justify-content-center">
          <div className="col-md-8 bg-dark p-5 rounded shadow" style={{ backgroundColor: 'rgba(33, 37, 41, 0.8)' }}>
            <h1 className="display-1 fw-bold text-danger mb-4 animate__animated animate__pulse animate__infinite">401</h1>
            <h2 className="text-white mb-4">Unauthorized Access</h2>
            <p className="text-light mb-4">
              Sorry, you don't have permission to access this page. Please check your credentials and try again.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-outline-light" onClick={handleGoBack}>
                Go Back
              </button>
              <button className="btn btn-primary" onClick={handleGoHome}>
                Return Home
              </button>
              <button className="btn btn-success" onClick={handleGoToLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error401;