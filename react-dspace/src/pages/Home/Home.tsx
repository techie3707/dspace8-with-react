import { Container, Grid, Button, Typography, Box, Card, CardContent } from "@mui/material";
import "./Home.css";
import { personsImgs } from '../../utils/images';
import 'bootstrap/dist/css/bootstrap.min.css';
import Carousel from "../../components/Carousel/Carousel";

const Home = () => {
  return (
    <Container maxWidth="lg" className="home-container">

      <div>
      <Carousel />
      {/* other homepage content */}
    </div>
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
              "title": "Academics",
              "description": "Stay updated with the latest trends in document management, digital archiving, and smart file systems.",
              "link": "/",
              "class": "card_a"
            },
            {
              "title": "Accounts",
              "description": "Explore essential strategies for data privacy, regulatory compliance, and secure document handling.",
              "link": "/",
              "class": "card_b"
            },
            {
              "title": "Adminstration",
              "description": "Learn how automation is transforming document processing, approvals, and team collaboration.",
              "link": "/",
              "class": "card_c"
            },
            {
              "title": "ATAB",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_d"
            },
               {
              "title": "CME",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_e"
            },
               {
              "title": "General Adminstartion",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_f"
            },
               {
              "title": "Library",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_g"
            },
               {
              "title": "Project",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_h"
            },
               {
              "title": "Publication",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              "link": "/",
              "class": "card_i"
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
