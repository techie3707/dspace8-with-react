import { Container, Grid, Button, Typography, Box, Card, CardContent } from "@mui/material";
import "./Home.css";
import { personsImgs } from '../../utils/images';
import 'bootstrap/dist/css/bootstrap.min.css';
import Carousel from "../../components/Carousel/Carousel";
import { useNavigate } from "react-router-dom";

const Home = () => {
   const navigate = useNavigate();
    const handleCardClick = (collectionId: string) => {
    navigate(`/adminSearch?page=0&size=10&sort=score%2CDESC&scope=${collectionId}`);
  };
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
              collectionId: "0d43e183-1ca7-4ac4-b9f2-74f126dc5f1f",
              "class": "card_a"
            },
            {
              "title": "Accounts",
              "description": "Explore essential strategies for data privacy, regulatory compliance, and secure document handling.",
               collectionId: "cb313e8c-1c5e-4395-bc7e-b396d42e6e04",
              "class": "card_b"
            },
            {
              "title": "Adminstration",
              "description": "Learn how automation is transforming document processing, approvals, and team collaboration.",
               collectionId: "c9ccfcf8-dd17-4e92-b1a9-d167e43dcc0c",
              "class": "card_c"
            },
            {
              "title": "ATAB",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
               collectionId: "71371f26-dfcd-49eb-b314-506f3c2989c1",
              "class": "card_d"
            },
               {
              "title": "CME",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
               collectionId: "409145ad-dbaf-4d2d-ad32-99691a11dd6a",
              "class": "card_e"
            },
               {
              "title": "General Adminstartion",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              collectionId: "4dbedabe-0bc2-4765-87b9-2e41aa60c595",
              "class": "card_f"
            },
               {
              "title": "Library",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
              collectionId: "9b22686f-52f6-40a2-8611-bfe838c18d9b",
              "class": "card_g"
            },
               {
              "title": "Project",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
               collectionId: "f65aeb76-83b6-437a-bf7c-715bc0b091ec",
              "class": "card_h"
            },
               {
              "title": "Publication",
              "description": "Discover scalable and reliable cloud-based document storage solutions for modern businesses.",
               collectionId: "0106bfef-f6ea-45da-9c3d-a254d113115e",
              "class": "card_i"
            },
          ].map((dept, index) => (
            <div
          className="col-12 col-sm-6 col-md-3 col-lg-3 col-xl-2"
          key={index}
        >
          <div
            className={`card ${dept.class}`}
            onClick={() => handleCardClick(dept.collectionId)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-content">
              <div className="card-title">{dept.title}</div>
              <div className="card-description">{dept.description}</div>
              <div className="card-date">28/2/2024</div>
            </div>
          </div>
        </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Home;
