import React, { useEffect, useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Pause, PlayArrow } from "@mui/icons-material";
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

    const steps = 200;
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
        height: "480px",
        overflow: "hidden",
      }}
    >
      {/* Slides */}
      {ImageSlider.map((img, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            transition: "opacity 0.5s ease-in-out",
            opacity: index === currentSlide ? 1 : 0,
            zIndex: index === currentSlide ? 2 : 1,
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

      {/* Play/Pause Button */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={() => setIsPaused(!isPaused)}
          sx={{
            color: "#1e4cf2",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
          }}
        >
          {isPaused ? <PlayArrow /> : <Pause />}
        </IconButton>
      </Box>

      {/* Prev Button */}
      <IconButton
        onClick={goToPrevSlide}
        sx={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#1e4cf2",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
          zIndex: 10,
        }}
      >
        <ArrowBackIos />
      </IconButton>

      {/* Next Button */}
      <IconButton
        onClick={goToNextSlide}
        sx={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#1e4cf2",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
          zIndex: 10,
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      {/* Progress Pills */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 1,
          zIndex: 10,
        }}
      >
        {ImageSlider.map((_, index) => {
          const isActive = index === currentSlide;
          const width = isActive
            ? MIN_PILL_WIDTH + (MAX_PILL_WIDTH - MIN_PILL_WIDTH) * (progress / INTERVAL_DURATION)
            : MIN_PILL_WIDTH;

          return (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: `${width}px`,
                height: "8px",
                borderRadius: "20px",
                background: isActive
                  ? "linear-gradient(to right, #1e4cf2, #63c19e)"
                  : "#fff",
                border: "1px solid #1e4cf2",
                cursor: "pointer",
                transition: "width 0.05s linear, background 0.3s ease",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default Carousel;
