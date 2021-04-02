const { spawn } = require('child_process')
const bs = require('browser-sync').create()

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
  proxy: "localhost:8888",
  watch: true
})
