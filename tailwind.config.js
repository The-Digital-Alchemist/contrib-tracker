/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ubuntu: {
          orange: {
            50: '#FFF7F3',
            100: '#FFEDE5', 
            200: '#FFD4C2',
            300: '#FFB894',
            400: '#FF9B6B',
            500: '#E95420',
            600: '#D04A1A',
            700: '#B63E16',
            800: '#9D3313',
            900: '#842B11',
          },
          purple: {
            50: '#F8F4F7',
            100: '#F0E8EE',
            200: '#E2D1DB',
            300: '#D3B9C8',
            400: '#C5A2B5',
            500: '#772953',
            600: '#6B2449',
            700: '#5F1F3F',
            800: '#531A35',
            900: '#47152B',
          },
          aubergine: {
            50: '#F5F2F4',
            100: '#EBE5E8',
            200: '#D6CBD1',
            300: '#C2B1BA',
            400: '#AD97A3',
            500: '#2C001E', 
            600: '#28001B',
            700: '#240018',
            800: '#200015',
            900: '#1C0012',
          },
          grey: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#AEA79F', 
            600: '#9E968E',
            700: '#8E847C',
            800: '#7E726A',
            900: '#6E6058',
          },
          cool: {
            50: '#F9F9F9',
            100: '#F2F2F2',
            200: '#E6E6E6',
            300: '#D9D9D9',
            400: '#CCCCCC',
            500: '#333333', 
            600: '#2E2E2E',
            700: '#292929',
            800: '#242424',
            900: '#1F1F1F',
          },
          accent: {
            50: '#F7F4F6',
            100: '#EFE8ED',
            200: '#DFD1DB',
            300: '#CFBAC9',
            400: '#BFA3B7',
            500: '#77216F', 
            600: '#6B1E63',
            700: '#5F1B57',
            800: '#53184B',
            900: '#47153F',
          }
        }
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'system-ui', 'sans-serif'],
        'ubuntu-mono': ['Ubuntu Mono', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
} 