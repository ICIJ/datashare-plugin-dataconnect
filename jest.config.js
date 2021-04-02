module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    // '^.+\\.vue$': 'vue-jest',
    // '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/unit/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(bootstrap-vue)/)'
  ],
  preset: '@vue/cli-plugin-unit-jest'
}
