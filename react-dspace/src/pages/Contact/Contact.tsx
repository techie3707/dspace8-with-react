import React from "react";
import "../../styles/contact.css";

const Contact = () => {
  return (
    <div className="contact-wrapper">
      <div className="contact-container">
        {/* Left Side: Map + Info */}
        <div className="contact-info-box">
          {/* Map Section */}
          <div className="contact-map-wrapper">
            <h2 className="form-title map-title">Contact Us</h2>
            <div className="contact-map">
              <iframe
  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d224040.29506090918!2d77.125436!3d28.670807000000003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03986aaaaaab%3A0xe1fbe446251ca22!2sRashtriya%20Ayurveda%20Vidyapeeth%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1747915427085!5m2!1sen!2sin"
  width="600"
  height="450"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
></iframe>


            </div>
          </div>

          {/* Info Section */}
          <div className="company-info">
            <h2 className="company-title">Rashtriya Ayurveda Vidyapeeth (RAV)</h2>
            <p className="company-address">
              📍 RASHTRIYA AYURVEDA VIDYAPEETH (National Academy of Ayurveda) Dhanvantari Bhavan,<br />
              Road No.66<br />
              Punjabi Bagh (West), NEW DELHI – 110 026.
            </p>
            <div className="company-contact">
              <p>📞 011-25229753</p>
              <p>📱 25228548</p>
              <p>📧 <a href="mailto:ravidyapeethdelhi@gmail.com">ravidyapeethdelhi@gmail.com</a></p>
            </div>

          </div>
        </div>

        {/* Right Side: Contact Form */}
        
      </div>
    </div>

  );
};

export default Contact;
