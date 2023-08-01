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
    extend: {
      maxWidth: {
        '320': '320px'
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.savjeeblack'),
            '--tw-prose-quotes': theme('colors.savjeeblack'),
            '--tw-prose-headings': theme('colors.savjeeblack'),
            '--tw-prose-links': theme('colors.savjeered'),
            '--tw-prose-hr': theme('colors.savjeelightgrey4'),
            '--tw-prose-pre-code': theme('colors.savjeelightgrey2'),
            '--tw-prose-pre-bg': theme('colors.savjeelightgrey2'),
            '--tw-prose-pre-code': theme('colors.savjeeblack'),
          }
        },
        dark: {
          css: {
            '--tw-prose-body': theme('colors.savjeewhite'),
            '--tw-prose-quotes': theme('colors.savjeewhite'),
            '--tw-prose-headings': theme('colors.savjeewhite'),
            '--tw-prose-links': theme('colors.savjeewhite'),
            '--tw-prose-hr': theme('colors.savjeelightgrey4'),
            '--tw-prose-pre-bg': "#111b27",
            '--tw-prose-pre-code': theme('colors.savjeewhite'),
            '--tw-prose-code': theme('colors.savjeewhite'),
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
    require('tailwindcss-base-font-size')({
      baseFontSize: 18,
    }),
  ],
}

