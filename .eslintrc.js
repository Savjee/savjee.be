module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "env": {
    "node": true,
    "browser": true,
  },
  "ignorePatterns": [
    // Ignore the generated site
    "_site/*"
  ],
  "overrides": [
    {
      "files": ["**/*.ts"],
      "parser": "@typescript-eslint/parser",
      "extends": [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
      ],
      "plugins": [
        "@typescript-eslint"
      ]
    },

    // Cloudflare Workers allow "export", so treat these as modules.
    {
      "files": ["functions/**/*"],
      "parserOptions": {
        "sourceType": "module",
      }
    }
  ]
}