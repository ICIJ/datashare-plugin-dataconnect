<script setup>
import IPhChatsTeardrop from '~icons/ph/chats-teardrop'
import { useCore } from '@/composables/useCore'
import { useCoreComponent } from '@/composables/useCoreComponent'
import { useDocumentComments } from '@/composables/useDocumentComments'
import { useDocumentCommentsStore } from '@/stores/documentComments'

defineProps({
  shorterLabels: {
    type: Boolean,
    default: false
  }
})

const DocumentUserActionsEntry = await useCoreComponent(
  'Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'
)

const { stores } = useCore()
const documentStore = stores.useDocumentStore()
const documentCommentsStore = useDocumentCommentsStore()
const { count, fetchCommentsCount } = useDocumentComments(documentStore.document)

await fetchCommentsCount()
</script>

<template>
  <document-user-actions-entry
    :active="documentCommentsStore.visible"
    :label="$t('commentsToggler.label', count, { n: count })"
    :value="String(count)"
    :icon="IPhChatsTeardrop"
    :hide-tooltip="!shorterLabels"
    :shorter-label="shorterLabels"
    @click="documentCommentsStore.toggle()"
  />
</template>
