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
          <h5>TechBets Infotech</h5>
          <h1>You belong here</h1>
          <div className="underline"></div>
          <p>
            Techbets Infotech Pvt. Ltd. is a forward-thinking technology company
            dedicated to transforming the way businesses manage, secure, and
            access their documents. With a strong belief in innovation and
            efficiency, we have developed a powerful Document Management System
            (DMS) designed to streamline document workflows, improve
            collaboration, and enhance data security across organizations of all
            sizes.
          </p>
        </div>
      </div>

      {/* Vision and Mission Cards */}
      <div className="cards-section">
        <div className="card vision-card">
          <h2>Our Vision</h2>
          <div className="underline"></div>
          <p>
            To be a global leader in providing intelligent, secure, and scalable document management solutions that not only drive productivity and innovation but also enable organizations to embrace a paperless, eco-friendly, and digitally empowered future.
            We envision a world where businesses can seamlessly manage information, ensure regulatory compliance, and foster collaboration — all through intuitive technology built for modern workspaces. At Techbets Infotech, we are committed to continuously evolving our platform to stay ahead of technological trends and deliver lasting value to our clients.
          </p>
        </div>

        <div className="card mission-card">
          <h2>Our Mission</h2>
          <div className="underline"></div>
          <p>
            Our mission is to redefine the way organizations handle documents by delivering cutting-edge, reliable, and customizable solutions that improve efficiency, transparency, and data security.
            Through our Document Management System, we aim to:

            Streamline document workflows and reduce manual effort

            Improve access and sharing of information across teams and departments

            Ensure the highest standards of data protection and compliance

            Minimize operational costs by eliminating physical paperwork

            Support scalability so businesses can grow without limits

            At Techbets Infotech Pvt. Ltd., we are driven by customer-centric innovation and a passion for helping organizations optimize performance through smart digital transformation.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
