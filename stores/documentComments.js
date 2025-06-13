import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'

import { useCore } from '@/composables/useCore'

export const useDocumentCommentsStore = defineStore('documentComments', () => {
  const core = useCore()
  const countByDocument = reactive({})
  const documentStore = core.stores.useDocumentStore()

  const visible = computed({
    get: () => documentStore.isUserActionVisible('COMMENTS'),
    set: (value) => documentStore.toggleUserAction('COMMENTS', value)
  })

  function toggle(value = null) {
    visible.value = value ?? !visible.value
  }

  return { visible, countByDocument, toggle }
})
