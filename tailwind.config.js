/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Lumira design system — matches lumira-ux-prototype.html
        ink: '#1A1B23',
        muted: '#6E7180',
        line: '#E7E6EE',
        surface: '#FFFFFF',
        canvas: '#F6F6FA',
        primary: {
          DEFAULT: '#5B5FEF',
          ink: '#FFFFFF',
          50: '#EEEEFD',
          100: '#D9DAF5',
          500: '#5B5FEF',
          600: '#4A4DE0',
          700: '#3D3FC7',
        },
        amber: {
          DEFAULT: '#F2A93C',
          ink: '#3A2A05',
        },
        teal: {
          DEFAULT: '#2FAE8E',
        },
        danger: {
          DEFAULT: '#E8776A',
          bg: '#FBEAE7',
          ink: '#C24C3B',
        },
        pending: { bg: '#FFF4E0', ink: '#B7791F' },
        processing: { bg: '#E5F0FF', ink: '#2563EB' },
        ready: { bg: '#E5F7F1', ink: '#0F7A5C' },
        rolebg: {
          owner: '#EDE9FE',
          admin: '#DBEAFE',
          member: '#E5F7F1',
        },
        roleink: {
          owner: '#6D28D9',
          admin: '#1D4ED8',
          member: '#0F7A5C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lumira: '16px',
      },
    },
  },
  plugins: [],
}
