<script setup>
import { ref, useTemplateRef, onBeforeMount } from 'vue'

import CommentsCardList from './CommentsCardList'

import { useCoreComponent } from '@/composables/useCoreComponent'
import { useDocumentComments } from '@/composables/useDocumentComments'
import { useWait } from '@/composables/useWait'
import { useDocumentCommentsStore } from '@/stores/documentComments'

const { document } = defineProps({
  document: {
    type: Object
  }
})

const DocumentUserComments = await useCoreComponent('Document/DocumentUser/DocumentUserComments/DocumentUserComments')
const documentCommentsStore = useDocumentCommentsStore()
const list = useTemplateRef('list')
const comment = ref('')
const { waitFor, isLoading } = useWait()
const { count, fetchCommentsCount, fetchCommentPage, fetchLastPage, createComment, virtualComments } =
  useDocumentComments(document)

const fetch = waitFor(async () => {
  await fetchCommentsCount()
  await fetchLastPage()
})

const createAndFetchComment = waitFor(async () => {
  await createComment(comment.value)
  await fetchCommentsCount()
  await fetchLastPage()
  await list.value?.scrollToBottom()
  // Finally, reset the comment input
  comment.value = ''
})

async function onPlaceholderVisible({ post_number: commentNumber }) {
  await fetchCommentPage(commentNumber)
}

onBeforeMount(fetch)
</script>

<template>
  <document-user-comments
    v-if="documentCommentsStore.visible"
    v-model="documentCommentsStore.visible"
    v-model:comment="comment"
    no-sort
    :disabled="isLoading"
    :count="count"
    :comments="virtualComments"
    @submit="createAndFetchComment"
  >
    <template v-if="virtualComments.length" #comments>
      <comments-card-list ref="list" :virtual-comments="virtualComments" @placeholder-visible="onPlaceholderVisible" />
    </template>
  </document-user-comments>
</template>
