module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    "no-multi-spaces": "off",
    // allow async-await
    'generator-star-spacing': 'off',
    "no-async-promise-executor":'off',
    'no-useless-escape':'off'
  }
}
