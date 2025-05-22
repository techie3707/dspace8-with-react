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
    <footer className="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold">
              {footerData.companyName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Services
            </Typography>
            {footerData.services.map((service) => (
              <Link key={service.id} href={service.path} color="inherit" display="block" underline="hover">
                {service.title}
              </Link>
            ))}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contacts
            </Typography>
            <Typography>Phone: {footerData.contacts.phone}</Typography>
            <Typography>Email: {footerData.contacts.email}</Typography>
            <Typography>Address: {footerData.contacts.address}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Social Media
            </Typography>
            <Grid container spacing={1}>
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