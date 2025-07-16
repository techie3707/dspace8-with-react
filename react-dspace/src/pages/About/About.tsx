import React from "react";
import "./about.css";
import { iconsImgs } from "../../utils/images";

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h5 className="about-subtitle">About Us</h5>
        <h1 className="about-title">EasySmartDocs</h1>
        <div className="about-underline"></div>
        <p className="about-description">
          <strong>EasySmartDocs</strong> is a powerful and intuitive Document Management System (DMS) solution
          designed to simplify and streamline document handling across industries. We empower organizations to digitize, organize,
          and manage documents securely while ensuring quick accessibility and version control.
        </p>
        <p className="about-description">
          With our modern, scalable architecture and user-friendly interface, ESD adapts to sectors like:
          <ul className="about-sectors">
            <li><strong>Healthcare</strong>: Manage patient records, prescriptions, lab reports, and compliance documents efficiently.</li>
            <li><strong>Education</strong>: Centralized management of academic records, certificates, and institutional archives.</li>
            <li><strong>Legal</strong>: Secure storage of contracts, case files, and legal documentation with access control.</li>
            <li><strong>Corporate & Government</strong>: Automate workflows, approvals, and policy documentation across departments.</li>
          </ul>
        </p>
        <p className="about-description">
          Our goal is to empower digital transformation with a secure, customizable, and collaborative document ecosystem.
          Join us in making document management smarter with <strong>EasySmartDocs</strong>.
        </p>
      </div>
    </div>
  );
};

export default About;
