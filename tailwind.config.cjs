/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        "0.1": "1px",
        "1": "3px",
        "1.5": "4px",
        "2": "6px",
        "2.5": "8px",
        "3": "9px",
        "3.5": "10px",
        "4": "12px",
        "4.5": "14px",
        "5": "15px",
        "5.5": "16px",
        "6": "18px",
        "6.5": "20px",
        "7": "21px",
        "7.5": "22px",
        "8": "24px",
        "8.5": "26px",
        "9": "27px",
        "9.5": "28px",
        "10": "30px",
        "10.5": "33px",
        "11": "36px",
      },
      fontFamily: {
        sans: ['SF Pro Display', 'sans-serif'],
        serif: ['Roslindale', 'serif'],
        sfpro: ['SF Pro Display', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        roslindale: ['Roslindale', 'sans-serif'],
        constantine: ['Constantine', 'sans-serif'],
        basier: ['Basier', 'sans-serif'],
        helvetica: ['Helvetica Neue', 'sans-serif'],
        garamond: ['GaramondPro', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        tupa: ['Tupa Nova', 'sans-serif'],
      },
      fontSize: theme => ({
        ...theme('spacing'),
      }),
      lineHeight: theme => ({
        ...theme('spacing'),
      }),
      borderRadius: theme => ({
        ...theme('spacing'),
      }),
      fontWeight: {
        '100': '100',
        '200': '200',
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
      },
      colors: {
        gray: {
          50: '#F9FAFB',
          100: '#F4F5F7',
          200: '#E4E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        "secondary-white": "#F1F1F1"
      }
    },
  },
  plugins: []
};
