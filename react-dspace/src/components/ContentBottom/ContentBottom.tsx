import React from "react";
import { Container, Grid } from "@mui/material";
import "./ContentBottom.css";

const ContentBottom: React.FC = () => {
  return (
    <footer className="custom-footer">
      <Container maxWidth="lg">
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          className="footer-grid"
        >
          <Grid item>
            <p
              tabIndex={0}
              style={{
                margin: 0,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              © Copyright 2025{" "}
              <a
                href="https://easysmartdocs.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", fontWeight: "bold", color: "inherit" }}
              >
                EasySmartDocs
              </a>{" "}
              All Rights Reserved.
            </p>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};

export default ContentBottom;