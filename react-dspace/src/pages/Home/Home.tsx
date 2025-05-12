import { Container, Grid, Button, Typography, Box, Card, CardContent } from "@mui/material";
import "./Home.css";
import { personsImgs } from '../../utils/images';
import 'bootstrap/dist/css/bootstrap.min.css';

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
          <Grid container spacing={2} className="key-features" sx={{ display: "flex", flexWrap: "nowrap", overflowX: "auto" }}>
            <Grid item sx={{ whiteSpace: "nowrap", paddingRight: 2 }}>✅ Central Source of Truth</Grid>
            <Grid item sx={{ whiteSpace: "nowrap", paddingRight: 2 }}>✅ Automate Reliably</Grid>
            <Grid item sx={{ whiteSpace: "nowrap", paddingRight: 2 }}>✅ Manage Access</Grid>
            <Grid item sx={{ whiteSpace: "nowrap", paddingRight: 2 }}>✅ Find Easily</Grid>
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

      </Typography>

      {/* Cards Section */}
      <div className="collection_mains">
        <div className="header-section">
          <h1 className="header-title">Latest Collections</h1>
          <div className="header-underline">
            <span className="arrow-down">&#9660;</span>
          </div>
        </div>
        <div className="row g-4">
          {[
            {
              "title": "Document Insights",
              "description": "Stay updated with the latest trends in document management, digital archiving, and smart file systems.",
              "link": "/",
              "class": "card_d"
            },
            {
              "title": "Compliance & Security",
              "description": "Explore essential strategies for data privacy, regulatory compliance, and secure document handling.",
              "link": "/",
              "class": "card_d"
            },
            {
              "title": "Workflow Automation",
              "description": "Learn how automation is transforming document processing, approvals, and team collaboration.",
              "link": "/",
              "class": "card_h"
            },
            {
              "title": "Cloud Storage Solutions",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_c"
            },
          ].map((dept, index) => (
            <div className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2" key={index}>
              <a href={dept.link} className={`card ${dept.class}`}>
                <div className="card-content">
                  <div className="card-title">{dept.title}</div>
                  <div className="card-description">{dept.description}</div>
                  <div className="card-date">28/2/2024</div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>


    </Container>
  );
};

export default Home;
