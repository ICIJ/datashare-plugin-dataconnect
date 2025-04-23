import { createPinia } from 'pinia'

class CorePlugin {
  install(app) {
    app.config.globalProperties.$core = this
    app.config.globalProperties.$t = (key) => key
  }

  findComponent(path) {
    const name = path.split('/').pop()
    const template = `
      <span>
        <slot />
        <slot name="text" />
      </span>
    `
    return { name, template }
  }

  get stores() {
    return {
      useDocumentStore() {
        return {
          document: {
            id: '1',
            index: 'banana-papers',
            slicedName: ['test.pdf']
          }
        }
      },
      useWaitStore() {
        return {
          isLoading: false,
          isReady: true,
          waitFor: (fn) => fn()
        }
      }
    }
  }

  get pinia() {
    this._pinia = this._pinia || createPinia()
    return this._pinia
  }

  get plugins() {
    return [this, this.pinia]
  }

  static init(...args) {
    return new CorePlugin(...args)
  }
}

export default CorePlugin
