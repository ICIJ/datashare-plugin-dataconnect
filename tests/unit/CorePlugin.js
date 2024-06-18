import { vi } from 'vitest'
import { Store } from 'vuex'

class CorePlugin {

  install(app) {
    app.config.globalProperties.$core = this
    app.config.globalProperties.$t = vi.fn().mockImplementation((key) => key)
    app.config.globalProperties.$i18n = { locale : 'en' }
    app.config.globalProperties.$wait = { start: vi.fn(), end: vi.fn(), is: vi.fn() }
  }

  createStore() {
    const document = { doc: { slicedName: 'test.pdf' }, idAndRouting: { id: '1', index: 'banana-papers' } }
    const state = { document, search: { index: 'banana-papers' } }
    return new Store({ state })
  }

  get store() {
    this._store = this._store || this.createStore()
    return this._store
  }

  get plugins() {
    return [this, this.store]
  }

  get stubs () {
    const BSpinner = { template: '<span />'}
    const ContentPlaceholder = { template: '<span><slot /></span>'}
    const VWait = { template: '<span><slot /></span>'}
    return { BSpinner, ContentPlaceholder, VWait }
  }

  static init(...args) {
    return new CorePlugin(...args)
  }
}

export default CorePlugin