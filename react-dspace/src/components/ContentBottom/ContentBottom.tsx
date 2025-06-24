import React from "react";
import { Container, Grid, Typography, Link, IconButton } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import "./ContentBottom.css";

const footerData = {
  companyName: "RAV Delhi",
  services: [
    { id: 1, title: "Service 1", path: "/service1" },
    { id: 2, title: "Service 2", path: "/service2" },
    { id: 3, title: "Service 3", path: "/service3" },
  ],
  contacts: {
    phone: "+91 123 456 7890",
    email: "contact@ravdelhi.com",
    address: "Delhi, India",
  },
  socialMedia: [
    { id: 1, title: "Facebook", link: "https://www.facebook.com/ravdelhi" },
    { id: 2, title: "Instagram", link: "https://www.instagram.com/ravdelhi/" },
    { id: 3, title: "Twitter", link: "https://x.com/RAVDelhi?t=oJ1Y3m7pqJd5UC7T2MTTug&s=08" },
  ],
};

const ContentBottom: React.FC = () => {
  return (
 <footer className="custom-footer">
  <Container maxWidth="lg">
    <Grid
      container
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      wrap="nowrap"
      className="footer-grid"
    >
      {/* Left side: Copyright Text */}
      <Grid item xs="auto">
        <p tabIndex={0} style={{ margin: 0, whiteSpace: 'nowrap' }}>
          © Copyright 2025 <b>TechBetsinfotech</b> All Rights Reserved.
        </p>
      </Grid>

      {/* Right side: Social Media Icons */}
      <Grid item xs>
        <Grid
          container
          spacing={1}
          justifyContent="flex-end"
          wrap="nowrap"
          className="social-icons"
        >
          {footerData.socialMedia.map((social) => (
            <Grid item key={social.id}>
              <IconButton href={social.link} target="_blank" color="inherit">
                {social.title === "Facebook" && <Facebook />}
                {social.title === "Twitter" && <Twitter />}
                {social.title === "Instagram" && <Instagram />}
                {social.title === "LinkedIn" && <LinkedIn />}
              </IconButton>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  </Container>
</footer>


  );
};

export default ContentBottom;