import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { viteExternalsPlugin } from 'vite-plugin-externals'

export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return defineConfig({
    plugins: [
      vue(),
      // Map Vue imports to the global `__VUE_SHARED__` and `__PINIA_SHARED__` objects on from `window`.
      // In test mode, Vue is provided by the test environment, so we don't need to externalize it.
      mode !== 'test' ? viteExternalsPlugin({ vue: '__VUE_SHARED__', vuex: '__PINIA_SHARED__' }) : null
    ],
    test: {
      globals: true,
      reporters: 'basic',
      environment: 'jsdom'
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'main.js'),
        name: 'index',
        fileName: 'index'
      }
    },
    resolve: {
      dedupe: ['vue'],
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        '@': path.resolve(__dirname),
        '@/components': path.resolve(__dirname, './components')
      }
    }
  })
}
