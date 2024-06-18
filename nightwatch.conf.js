module.exports = {
  src_folders: ['./tests/e2e'],
  webdriver: {
    start_process: true,
    port: 4444,
    server_path: require('geckodriver').path
  },
  test_settings: {
    default: {
      launch_url: 'about:blank',
      desiredCapabilities : {
        browserName : 'firefox',
        alwaysMatch: {
          'moz:firefoxOptions': {
            args: ['-headless'],
          }
        }
      }
    }
  }
}
