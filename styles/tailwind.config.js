module.exports = {
  purge: {
    content: ["_site/**/*.html"],
    options: {
      whitelist: [],
    },
  },
  theme: {
    extend: {
      colors: {
        change: "black",
      },
      screens: {
        dark: {'raw': '(prefers-color-scheme: dark)'},
      }
    },
  },
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
  }
};
