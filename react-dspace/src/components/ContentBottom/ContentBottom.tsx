import React from "react";
import { Container, Grid, Typography, Link, IconButton } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import { footerData } from "../../data/data";
import "./ContentBottom.css";

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
