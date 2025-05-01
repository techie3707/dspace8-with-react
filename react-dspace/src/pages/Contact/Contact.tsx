import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid
} from '@mui/material';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150); // milliseconds per character

  const texts = [
    "Have Any Questions?",
    "Need Help With Something?",
    "Want To Know More?",
    "How Can We Help You?"
  ];

  useEffect(() => {
    const currentText = texts[currentTextIndex];

    if (!isDeleting && displayText.length === currentText.length) {
      setTimeout(() => setIsDeleting(true), 2000);
      return;
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
      setTypingSpeed(isDeleting ? 5 : 5);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        setTypingSpeed(isDeleting ? 5 : 5);
      } else {
        setDisplayText(currentText.substring(0, displayText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, currentTextIndex, isDeleting, texts, typingSpeed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Container maxWidth="md"
      className='container'
      sx={{ mt: 4, mb: 4 }}>
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
        Contact Us
      </Typography>
      <Typography variant='h4' sx={{
        fontSize: '30px',
        fontWeight: 500,
        mt: 2,
        minHeight: '1.5em',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}>
        {displayText}
      </Typography>
      <Typography variant='body1' sx={{ fontSize: '20px', mt: 2, fontFamily: 'serif' }}>if you have any questions, please fill out the below form our team will get back to you as soon as possible.</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Your Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          // fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5, px: 4, backgroundColor: '#007bff', color: '#fff', '&:hover': { backgroundColor: '#0056b3' } }}
        >
          Submit Form
        </Button>
      </Box>
    </Container>
  );
};

export default Contact;