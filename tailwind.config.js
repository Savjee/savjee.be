const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "src/site/_includes/**/*.html",
    "src/site/*.{html,liquid}"
  ],
  theme: {
    fontFamily: {
      sans: [
        "Poppins2", ...defaultTheme.fontFamily.sans
      ]
    },
    colors: {
      'savjeered': '#E62643',
      'savjeeblue': '#1E2546',
      'savjeeblack': '#333333',
      'savjeewhite': '#FFFFFF',
      'savjeelightgrey': '#E5E5E5',
      'savjeelightgrey2': '#F5F5F5',
      'savjeelightgrey3': '#7F7F7F',
      'savjeelightgrey4': '#CCCCCC',
    },
    fontSize: {
      '4xl': ['60px', '84px'], // Page title
      '3xl': ['48px', '67px'], // H2
      '2xl': ['36px', '44px'], // H3
      'xl':  ['28px', '44px'], // H4
      'lg':  ['20px', '24px'],
      'base':['18px', '36px'],
      'sm':  ['14px', '20px'],
    },
    extend: {
      maxWidth: {
        '320': '320px'
      }
    }
  },
  plugins: [],
}

