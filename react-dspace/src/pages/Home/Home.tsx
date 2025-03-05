import React from "react";
import "../../styles/home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Our Website</h1>
        <p>Your gateway to excellence</p>
      </header>
      
      <section className="home-content">
        <div className="home-card">
          <h2>Our Services</h2>
          <p>We offer top-notch solutions tailored for you.</p>
        </div>
        <div className="home-card">
          <h2>About Us</h2>
          <p>We are committed to delivering the best experience.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2025 All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
