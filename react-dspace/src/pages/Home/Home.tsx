import React from "react";
import { Container, Grid, Button, Typography, Box, Card, CardContent } from "@mui/material";
import "./Home.css";
import { personsImgs } from '../../utils/images';

const Home = () => {
  return (
    <Container maxWidth="lg" className="home-container">
      {/* New Feature Section */}
      <Box className="feature-section" sx={{ display: "flex", alignItems: "center", py: 6 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" gutterBottom>
            Document Management System Software
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The world’s most user-friendly DMS for secure document management, e-signatures, and seamless compliance.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button variant="contained" color="primary">Try for Free!</Button>
            <Button variant="outlined" color="primary">Overview Video!</Button>
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>KEY FEATURES:</Typography>
          <Grid container spacing={2} className="key-features">
            <Grid item xs={6}>✅ Central Source of Truth</Grid>
            <Grid item xs={6}>✅ Automate Reliably</Grid>
            <Grid item xs={6}>✅ Manage Access</Grid>
            <Grid item xs={6}>✅ Find Easily</Grid>
          </Grid>
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <img className="" src={personsImgs.home_main} alt="profile" />
        </Box>
      </Box>

      {/* New Cards Section */}
      <Typography
  variant="h5"
  fontWeight="bold"
  sx={{
    textAlign: 'center',
    textDecoration: 'underline',
    mb: 3
  }}
>
  Latest Collections 
</Typography>

{/* Cards Section */}
<Grid container spacing={1} className="cards-section">
  {[
    { title: "Academics", description: "Combine PDFs in the order you want with the easiest PDF merger available." },
    { title: "Accounts", description: "Separate one page or a whole set for easy conversion into independent PDF files." },
    { title: "General Administrative", description: "Reduce file size while optimizing for maximal PDF quality." },
    { title: "Publication", description: "Add text, images, shapes or freehand annotations to a PDF document." }
  ].map((card, index) => (
    <Grid item xs={12} sm={6} md={2} key={index}>
      <Card className="feature-card">
        <CardContent>
          <Typography variant="h6" fontWeight="bold">{card.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            {card.description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
    </Container>
  );
};

export default Home;
