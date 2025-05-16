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
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d28027.806321009335!2d77.313586!3d28.585500000000003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfba1e9001e9b%3A0x6129e4f609e83867!2sTechbets%20Infotech!5e0!3m2!1sen!2sus!4v1746185872822!5m2!1sen!2sus"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />


            </div>
          </div>

          {/* Info Section */}
          <div className="company-info">
            <h2 className="company-title">Techbets Infotech Pvt. Ltd.</h2>
            <p className="company-address">
              📍 B-8, B Block, Sector 2<br />
              Noida, Uttar Pradesh 201301<br />
              (Near to Noida Sector - 15,)
            </p>
            <div className="company-contact">
              <p>📞 +91 8080004990</p>
              <p>📱 +91 9999363633</p>
              <p>📧 <a href="mailto:info@techbets.in">info@techbets.in</a></p>
            </div>

          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="contact-form-box">
          <h2 className="form-title">Send Us a Message</h2>
          <form className="contact-form">
            <div className="form-group">
              <label className="contact_label">Full Name <span>*</span></label>
              <input className="input_contact" type="text" required placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label className="contact_label">Email Address <span>*</span></label>
              <input className="input_contact" type="email" required placeholder="example@mail.com" />
            </div>
            <div className="form-row">
              <div className="form-phone">
                <label className="contact_label">Contact Number <span>*</span></label>
                <input className="input_contact" type="tel" required placeholder="Your phone number" />
              </div>
            </div>
            <div className="form-group">
              <label className="contact_label">Comments</label>
              <textarea rows={4} placeholder="Your message..."></textarea>
            </div>
            <button type="submit">SEND MESSAGE</button>
          </form>
        </div>
      </div>
    </div>

  );
};

export default Contact;
