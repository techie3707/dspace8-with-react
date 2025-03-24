import * as React from 'react';
import { styled, alpha, Box } from '@mui/system';
import { Slider as BaseSlider, sliderClasses } from '@mui/base/Slider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';



interface YearRangeSliderProps {
    onApply: (startYear: number, endYear: number) => void;
  }
  
  export default function YearRangeSlider({ onApply }: YearRangeSliderProps) {
    const minYear = 1950;
    const maxYear = 2025;
    const [value, setValue] = React.useState<number[]>([1955, 1981]);
    
    const handleChange = (event: Event, newValue: number | number[]) => {
      setValue(newValue as number[]);
    };
    
    const handleApply = () => {
      onApply(value[0], value[1]);
    };
  
    return (
        <Box sx={{ padding: 2, backgroundColor: '#e9eff2', borderRadius: '4px', marginBottom: 2 }} className="slider-container">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }} className="slider-inputs">
          <TextField
            value={value[0]}
            onChange={(e) => setValue([Number(e.target.value), value[1]])}
            variant="outlined"
            size="small"
            InputProps={{
              style: { width: '120px' }
            }}
          />
          <TextField
            value={value[1]}
            onChange={(e) => setValue([value[0], Number(e.target.value)])}
            variant="outlined"
            size="small"
            InputProps={{
              style: { width: '120px' }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleApply}
            className="slider-apply-btn"
          >
            APPLY
          </Button>
        </Box>
        
        <Slider
          value={value}
          onChange={handleChange}
          min={minYear}
          max={maxYear}
          getAriaLabel={() => 'Year range'}
          getAriaValueText={valuetext}
        />
      </Box>
    );
  }

function valuetext(value: number) {
  return `${value}`;
}

const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B3',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

// Custom styled slider to match the blue color in the image
const Slider = styled(BaseSlider)(
  ({ theme }) => `
  color: #5599cc;
  height: 6px;
  width: 90%;
  padding: 16px 0;
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;

  &.${sliderClasses.disabled} {
    pointer-events: none;
    cursor: default;
    color: ${theme.palette.mode === 'light' ? grey[300] : grey[600]};
    opacity: 0.4;
  }

  & .${sliderClasses.rail} {
    display: block;
    position: absolute;
    width: 100%;
    height: 4px;
    border-radius: 6px;
    background-color: #ccdde8;
  }

  & .${sliderClasses.track} {
    display: block;
    position: absolute;
    height: 4px;
    border-radius: 6px;
    background-color: currentColor;
  }

  & .${sliderClasses.thumb} {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    margin-left: -6px;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border-radius: 50%;
    outline: 0;
    background-color: #5599cc;
    transition-property: box-shadow, transform;
    transition-timing-function: ease;
    transition-duration: 120ms;
    transform-origin: center;

    &:hover {
      box-shadow: 0 0 0 6px ${alpha('#5599cc', 0.3)};
    }

    &.${sliderClasses.focusVisible} {
      box-shadow: 0 0 0 8px ${alpha('#5599cc', 0.5)};
      outline: none;
    }

    &.${sliderClasses.active} {
      box-shadow: 0 0 0 8px ${alpha('#5599cc', 0.5)};
      outline: none;
      transform: scale(1.2);
    }
  }

  & .${sliderClasses.mark} {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 99%;
    background-color: #ccdde8;
    top: 44%;
    transform: translateX(-50%);
  }

  & .${sliderClasses.markActive} {
    background-color: #5599cc;
  }
`,
);