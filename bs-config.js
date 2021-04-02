const { spawn } = require('child_process')
const bs = require('browser-sync').create()
// Read port from the first argument.
// By default we use the 8888 port which is the one we use on Datashare devenv.
const DATASHARE_PORT = process.argv.slice(2).pop() || 8888

function yarn(opts = [], label = null) {
  if (label !== null) {
    console.log('[\x1b[34myarn\x1b[0m]', label)
  }
  const cmd = spawn('yarn', opts, { stdio:'inherit' });
  return new Promise(resolve => {
    cmd.on('exit', resolve)
  })
}

bs.init({
  files: [
    {
      match: ['main.js', 'components/*.{vue,js}'],
      async fn (event, file) {
        try {
          await yarn(['run', 'build'], 'Compiling with vue-cli...');
          await yarn(['run', 'test:pack'], 'Installing plugin...');
          bs.reload()
        } catch (e) {
          console.log('[\x1b[31merror\x1b[0m] %s', e)
        }
      }
    }
  ],
  ignore: ['tmp/**/*', 'dist/**/*'],
  open: false,
  proxy: `localhost:${DATASHARE_PORT}`,
  watch: true
})
