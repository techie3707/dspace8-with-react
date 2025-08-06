import { Container, Typography, Box, Grid } from "@mui/material";
import "./Home.css";
import Carousel from "../../components/Carousel/Carousel";

const features = [
  {
    title: "Document Organization",
    description:
      "Organize your entire repository into logical communities and collections with seamless drag-and-drop support and visual hierarchy for efficient discovery.",
  },
  {
    title: "Metadata Management",
    description:
      "Enrich every document with detailed metadata including author, department, date, and keywords—making them easier to retrieve, sort, and classify.",
  },
  {
    title: "Advanced Search",
    description:
      "Use full-text, faceted, and filtered search capabilities to instantly locate documents, users, or workflows—empowered by a lightning-fast indexing engine.",
  },
  {
    title: "Secure Access Control",
    description:
      "Role-based access permissions ensure every user sees only what they need. Enable public, restricted, or internal views with custom rule sets.",
  },
  {
    title: "Version Control",
    description:
      "Track and manage multiple document versions, with change logs, rollback options, and approvals—perfect for collaborative document editing and history audit.",
  },
  {
    title: "File Previews",
    description:
      "Preview documents like PDFs, Word files, images, and presentations without downloading. Enjoy native browser rendering with smooth, secure viewing.",
  },
  {
    title: "Workflow Automation",
    description:
      "Automate document approvals, routing, tagging, and notifications using customizable workflows that save time and eliminate manual steps.",
  },
  {
    title: "Audit Trails",
    description:
      "Every user action is logged—from upload to deletion. Ensure accountability, monitor access behavior, and comply with institutional policies.",
  },
  {
    title: "Analytics & Reporting",
    description:
      "Track document access, downloads, user activity, and system performance through powerful dashboards and exportable reports for actionable insights.",
  },
];

const Home = () => {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ maxWidth: "100% !important", px: "16px" }}
      className="home-container"
    >
      <Box mb={5}>
        <Carousel />
      </Box>

      <Box textAlign="center" mb={6}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: "#1e4cf2",
            mb: 1,
            fontFamily: "Lato, sans-serif",
          }}
        >
          Smart, Secure, Scalable Document Management with EasySmartDocs
        </Typography>
        <Box
          sx={{
            width: 120,
            height: 5,
            margin: "auto",
            background: "linear-gradient(to right, #1e4cf2, #63c19e)",
            borderRadius: 4,
          }}
        />
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Box
              sx={{
                p: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)",
                boxShadow: "0 8px 24px rgba(30, 76, 242, 0.1)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 32px rgba(30, 76, 242, 0.25)",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  color: "#1e4cf2",
                  fontFamily: "EB Garamond, serif",
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#333",
                  lineHeight: 1.7,
                  fontFamily: "Lato, sans-serif",
                }}
              >
                {feature.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
