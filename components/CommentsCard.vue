<script setup>
import { useTemplateRef } from 'vue'

import CommentsCardList from './CommentsCardList'

import { useCoreComponent } from '@/composables/useCoreComponent'
import { useDocumentComments } from '@/composables/useDocumentComments'
import { useDocumentCommentsStore } from '@/stores/documentComments'

const { document } = defineProps({
  document: {
    type: Object
  }
})

const DocumentUserComments = await useCoreComponent('Document/DocumentUser/DocumentUserComments/DocumentUserComments')
const documentCommentsStore = useDocumentCommentsStore()
const list = useTemplateRef('list')
const { count, fetchCommentsCount, fetchCommentPage, fetchLastPage, createComment, virtualComments } =
  useDocumentComments(document)

await fetchCommentsCount()
await fetchLastPage()

async function createAndFetchComment(raw) {
  await createComment(raw)
  await fetchCommentsCount()
  await fetchLastPage()
  await list.value?.scrollToBottom()
}

async function onPlaceholderVisible({ post_number: commentNumber }) {
  await fetchCommentPage(commentNumber)
}
</script>

<template>
  <document-user-comments
    v-if="documentCommentsStore.card.visible"
    :count="count"
    :comments="virtualComments"
    @submit="createAndFetchComment"
  >
    <template v-if="virtualComments.length" #comments>
      <comments-card-list ref="list" :virtual-comments="virtualComments" @placeholder-visible="onPlaceholderVisible" />
    </template>
  </document-user-comments>
</template>
