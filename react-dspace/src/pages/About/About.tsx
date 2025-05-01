import React, { useState } from "react";
import "../../styles/about.css";
import { Box, Card, Container, Typography, Button, CardContent } from "@mui/material";
import { about_us, iconsImgs, personsImgs } from "../../utils/images";
import './about.css';
import { useNavigate } from "react-router-dom";
const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"vision" | "mission">("vision");
  const Navigate = useNavigate();

  const features = [
    { id: 1, name: "Big Data Analysis" },
    { id: 2, name: "High Quality Security" },
    { id: 3, name: "24/7 Online Support" },
    { id: 4, name: "24/7 Expert Team" },
    { id: 5, name: "Business Improvement" },
    { id: 6, name: "Easy Solutions" },
  ];

  return (
    <Container className="container" sx={{ padding: { xs: 2, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          backgroundColor: "#f9f9f9",
          borderRadius: "5px",
          textAlign: "center",
          width: '100%',
          padding: 2,
          marginTop: 0
        }}
        className="about-title"
      >
        About Us
      </Typography>

      {/* First Section */}
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        marginTop: "20px",
        gap: 3
      }}>
        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <img
            src={about_us.preview}
            alt="About Us"
           
            className="about-image"
          />
        </Box>

        <Box sx={{ width: { xs: "100%", md: "50%" },display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center" }}>
            <img src={personsImgs.brand_one} alt="Brand" style={{ width: "50px", height: "30px", marginRight: "5px" }} />
            About Us
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
            We Are Increasing Business Success With <span style={{ color: "orange" }}>IT Solution</span>
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "serif", fontSize: "20px", marginBottom: "10px" }}>
            Welcome to our <span style={{ color: "orange", fontWeight: "semibold" }}>EASY SMART DOC</span> application! We are a team of dedicated developers committed to providing you with
            the best experience possible. Our goal is to create a user-friendly platform that allows you to easily manage and access your digital content.
            Easy Smart Docs provides a full suite of services such as software development, software consulting, web design, database management, and software maintenance.
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        marginTop: 5,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
        alignItems: "stretch"
      }}>
        <Card 
        className="about-card"
        sx={{
          borderRadius: "8px",
          boxShadow: 3,
          width: { xs: "100%", md: "50%" },
          display: "flex",
          flexDirection: "column",
          position: 'relative'
        }}>
          <Box sx={{
            display: "flex",
            width: "100%",
            borderBottom: "1px solid #e0e0e0",
          }}>
            <Button
              fullWidth
              variant={activeTab === "vision" ? "contained" : "outlined"}
              onClick={() => setActiveTab("vision")}
              sx={{
                fontWeight: "bold",
                backgroundColor: activeTab === "vision" ? "primary.main" : "transparent",
                color: activeTab === "vision" ? "white" : "primary.main",
                borderRadius: "8px 0 0 0",
                py: 2,
                '&:hover': {
                  backgroundColor: activeTab === "vision" ? "primary.dark" : "primary.light"
                }
              }}
            >
              Our Vision
            </Button>
            <Button
              fullWidth
              variant={activeTab === "mission" ? "contained" : "outlined"}
              onClick={() => setActiveTab("mission")}
              sx={{
                fontWeight: "bold",
                backgroundColor: activeTab === "mission" ? "primary.main" : "transparent",
                color: activeTab === "mission" ? "white" : "primary.main",
                borderRadius: "0 8px 0 0",
                py: 2,
                '&:hover': {
                  backgroundColor: activeTab === "mission" ? "primary.dark" : "primary.light"
                }
              }}
            >
              Our Mission
            </Button>
          </Box>

          {/* Card content */}
          <CardContent sx={{ flex: 1 }}>
            {activeTab === "vision" ? (
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, pt: 2 }}>
                <Box sx={{ width: { xs: "100%", md: "40%" } }}>
                  <img
                    src={about_us.person}
                    alt="Vision"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "500px",
                      // objectFit: "cover",
                      borderRadius: "8px"
                    }}
                    
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "60%" } }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                    Our Vision for the Future
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: "18px", lineHeight: 1.6 }}>
                    To be a leading provider of innovative technology solutions, driving growth and success for businesses worldwide through excellence and expertise.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, pt: 2 }}>
                <Box sx={{ width: { xs: "100%", md: "40%" } }}>
                  <img
                    src={about_us.person}
                    alt="Mission"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "500px",
                      // objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "60%" } }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                    Our Mission for the Future
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: "20px", fontFamily: "serif", lineHeight: 1.6 }}>
                    Deliver innovative technology solutions, ensuring excellence and customer satisfaction, to empower businesses in achieving their growth and success goals.
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Image taking 50% width */}
        <Box sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <img
            src={about_us.business_person}
            alt="Business Person"
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "500px",
              objectFit: "cover",
              borderRadius: "8px"
            }}
            className="about-image"
          />
        </Box>
      </Box>
      <Box sx={{ marginTop: 5, textAlign: "center" }}>
      <Typography>
        <img src={personsImgs.brand_one} alt="Group Icon" style={{ width: "50px", height: "30px", marginRight: "5px" }} />
        WHY CHOOSE US
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: "bold", marginTop: 2 }}>
      We Deal With The Aspects Professional <span style={{color:"orange"}}> IT Services</span>
</Typography>
<Typography variant="body1">Collaboratively envisioneer user friendly supply chains and cross unit imperative. 
  Authoritativel fabricate competitive resource and holistic.</Typography>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(2, 1fr)" },
        gap: 3,
        marginTop: 3
      }}>
        {features.map((feature) => (
          <Card key={feature.id} className="about-card" sx={{ padding: 2, textAlign: "center", borderRadius: "8px", boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
              {feature.name}
            </Typography>
          </Card>
        ))}
        </Box>
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: "bold", marginTop: 5, textAlign: "center" }}>
          Meet Our Team
        </Typography>
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 3
        }}>
          <img src={personsImgs.person_one} alt="Team Member" style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
          <img src={personsImgs.person_one} alt="Team Member" style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
          <img src={personsImgs.person_one} alt="Team Member" style={{ width: "150px", height: "150px", borderRadius: "50%" }} />
        </Box>
      </Box>
      <Box sx={{ textAlign: "center", marginTop: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Join us on our journey to success!
        </Typography>
        <Button variant="contained" color="primary" 
        onClick={() => Navigate('/contact')}
        sx={{ marginTop: 2 }}>
          Contact Us
        </Button>
        </Box>

    </Container>
  );
};

export default About;