module.exports = {
  purge: {
    content: [
      "src/**/*.html",
      "src/**/*.liquid",
    ],
    options: {
      whitelist: [],
    },
  },
  theme: {
    extend: {
      padding: {"fluid-video": "56.25%" },
      colors: {
        change: "black",
        savjeeblack: {
          '100': '#f5f5f5',
          '200': '#eeeeee',
          '300': '#e0e0e0',
          '400': '#bdbdbd',
          '500': '#9e9e9e',
          '600': '#757575',
          '700': '#616161',
          '800': '#323232',
          '900': '#212121',
        },
      },
    },
  },
  darkMode: "media",
  variants: {},
  plugins: [],
};
