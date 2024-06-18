class CorePlugin {
  install(app) {
    app.config.globalProperties.$core = this
    app.config.globalProperties.$t = vi.fn().mockImplementation((key) => key)
    app.config.globalProperties.$i18n = { locale : 'en' }
  }
  static init(...args) {
    return new CorePlugin(...args)
  }
}

export default CorePlugin