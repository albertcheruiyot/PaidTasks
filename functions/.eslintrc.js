module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "indent": ["error", 2],
    "max-len": ["error", {code: 200}],
    "no-trailing-spaces": "error",
    "eol-last": "error",
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "never"],
    // Add this new rule to allow unused function parameters
    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "none", // This allows all function arguments to be unused
      "ignoreRestSiblings": false,
    }],
  },
};
