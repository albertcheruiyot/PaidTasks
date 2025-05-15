// src/styles/theme.js

const theme = {
    colors: {
      primary: '#2563EB', // Blue
      secondary: '#7C3AED', // Purple
      success: '#10B981', // Green
      warning: '#F59E0B', // Yellow
      error: '#EF4444', // Red
      info: '#3B82F6', // Light Blue
      background: '#F9FAFB', // Light Gray
      card: '#FFFFFF', // White
      text: {
        primary: '#1F2937', // Dark Gray
        secondary: '#6B7280', // Medium Gray
        light: '#9CA3AF', // Light Gray
        white: '#FFFFFF' // White
      }
    },
    fonts: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      bold: 700
    },
    radii: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    breakpoints: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    transitions: {
      default: '0.3s ease-in-out',
      fast: '0.15s ease-in-out',
      slow: '0.5s ease-in-out'
    },
    space: {
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem'
    }
  };
  
  export default theme;