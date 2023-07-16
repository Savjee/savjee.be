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
        ...defaultTheme.fontFamily.sans
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
      'savjeelightgrey5': '#FAFAFA'
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
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.savjeeblack'),
            '--tw-prose-headings': theme('colors.savjeeblack'),
            '--tw-prose-links': theme('colors.savjeered'),
            '--tw-prose-hr': theme('colors.savjeelightgrey4'),
            '--tw-prose-pre-code': theme('colors.savjeelightgrey2'),
            '--tw-prose-pre-bg': theme('colors.savjeelightgrey2'),
            '--tw-prose-pre-code': theme('colors.savjeeblack'),
          }
        }
      }),
    }
  },
  safelist: [
    "csl-bib-body"
  ],
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

