import React, { useEffect, useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  Pause,
  PlayArrow,
} from "@mui/icons-material";
import { ImageSlider } from "../../utils/images";

const INTERVAL_DURATION = 5000; // 5 seconds
const MAX_PILL_WIDTH = 40; // max pill width in px
const MIN_PILL_WIDTH = 10;

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = 0;
    setProgress(0);

    const steps = 200; // More steps = smoother
    const stepDuration = INTERVAL_DURATION / steps;

    const progressInterval = setInterval(() => {
      progressRef.current += stepDuration;
      setProgress(progressRef.current);
    }, stepDuration);

    const slideTimer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % ImageSlider.length);
      setProgress(0);
      clearInterval(progressInterval);
    }, INTERVAL_DURATION);

    return () => {
      clearTimeout(slideTimer);
      clearInterval(progressInterval);
    };
  }, [currentSlide, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ImageSlider.length) % ImageSlider.length);
    setProgress(0);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ImageSlider.length);
    setProgress(0);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "400px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {ImageSlider.map((img: string, index: number) => (
        <Box
          key={index}
          sx={{
            display: index === currentSlide ? "block" : "none",
            width: "100%",
            height: "100%",
            position: "absolute",
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <img
            src={img}
            alt={`Slide ${index}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      ))}

      {/* Controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => setIsPaused(!isPaused)}
          sx={{
            color: "red",
          }}
        >
          {isPaused ? <PlayArrow /> : <Pause />}
        </IconButton>

        <IconButton
          onClick={goToPrevSlide}
          sx={{
            color: "red",
            
          }}
        >
          <ArrowBackIos />
        </IconButton>

        {/* Smooth Dot-to-Pill Transition */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {ImageSlider.map((_, index) => {
            const isActive = index === currentSlide;
            const width =
              isActive && progress <= INTERVAL_DURATION
                ? MIN_PILL_WIDTH + (MAX_PILL_WIDTH - MIN_PILL_WIDTH) * (progress / INTERVAL_DURATION)
                : MIN_PILL_WIDTH;

            return (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: `${width}px`,
                  height: "10px",
                  borderRadius: "20px",
                  backgroundColor: isActive ? "#ff1744" : "#ffffff",
                  border: "1px solid #ff1744",
                  cursor: "pointer",
                  transition: "width 0.03s linear, background-color 0.3s ease",
                }}
              />
            );
          })}
        </Box>

        <IconButton
          onClick={goToNextSlide}
          sx={{
            color: "red",
          }}
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Carousel;
