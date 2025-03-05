import React from "react";
import "../../styles/about.css";

const About: React.FC = () => {
  return (
    <section className="about">
      <div className="about__container">
        <div className="about__image">
          <img src="/images/about-us.jpg" alt="About Us" />
        </div>
        <div className="about__content">
          <h2 className="about__title">About Us</h2>
          <p className="about__description">
            We are a team of dedicated professionals committed to delivering 
            high-quality solutions. Our mission is to create innovative 
            products that make a real impact.
          </p>
          <button className="about__button">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default About;
