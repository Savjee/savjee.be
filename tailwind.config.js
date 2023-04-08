const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "src/site/_includes/**/*.html"
  ],
  theme: {
    fontFamily: {
      sans: [
        "Poppins", ...defaultTheme.fontFamily.sans
      ]
    },
    colors: {
      'savjeered': '#E62643',
      'savjeeblue': '#1E2546',
      'savjeeblack': '#333333',
      'savjeelightgrey': '#E5E5E5',
    },
    fontSize: {
      sm: ['14px', '20px'],
      base: ['16px', '32px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
      '4xl': ['60px', '84px'], // H1
      '3xl': ['48px', '67px'], // H2
      '2xl': ['36px', '44px'], // H3
      'xl': ['24px', '44px'], // H4
    }
  },
  plugins: [],
}

