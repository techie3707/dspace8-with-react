import React from "react";
import "../../styles/about.css";
import { iconsImgs } from "../../utils/images";

const About: React.FC = () => {
  return (
    <>
      <div className="career-container">
        <img
          className="career-background"
          src={iconsImgs.aboutBack}
          alt="Career Background"
        />
        <div className="career-content">
          <h5>About Us</h5>
          <h1>Rashtriya Ayurveda Vidyapeeth (RAV)</h1>
          <div className="underline"></div>
          <p>
            an autonomous organization under the Ministry of Ayush, Govt. of India was constituted in 1988 with the objective of reviving classical practical and textual knowledge of Ayurveda through ancient Gurukula method of learning. The targeted learners here are the fresh graduates and post-graduates of Ayurveda still desirous of making themselves more proficient in classical Ayurvedic practices and principles.
          </p>
        </div>
      </div>

      
     
    </>
  );
};

export default About;
