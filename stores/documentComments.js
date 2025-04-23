import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useDocumentCommentsStore = defineStore('documentComments', () => {
  const card = reactive({ visible: false })
  const countByDocument = reactive({})

  function toggleCard() {
    card.visible = !card.visible
  }

  return { card, countByDocument, toggleCard }
})
