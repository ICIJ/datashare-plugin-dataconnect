<script setup>
import { computed } from 'vue'

import { useCoreComponent } from '@/composables/useCoreComponent'

const { comment, highlight } = defineProps({
  comment: {
    type: Object,
    required: true
  },
  highlight: {
    type: Boolean
  }
})

const DocumentUserCommentsListEntry = await useCoreComponent(
  'Document/DocumentUser/DocumentUserComments/DocumentUserCommentsListEntry'
)

const classList = computed(() => {
  return {
    'comments-card-list-comment--highlight': highlight
  }
})

const cooked = computed(() => {
  const { host: discourseHost } = new URL(comment.full_url)
  const { host: datashareHost, protocol: datashareProtocol } = window.location
  return (
    comment.cooked
      // Fix links to Datashare to include the protocol
      .split(`src="//${datashareHost}/`)
      .join(`src="${datashareProtocol}//${datashareHost}/`)
      // Add a target blank to links to Discourse
      .split(`href="//${discourseHost}/`)
      .join(`target="_blank" href="//${discourseHost}/`)
  )
})
</script>

<template>
  <document-user-comments-list-entry
    class="comments-card-list-comment"
    :class="classList"
    :username="comment.username"
    :date="comment.created_at"
    :href="comment.full_url"
  >
    <template #text>
      <div v-html="cooked" />
    </template>
  </document-user-comments-list-entry>
</template>

<style lang="scss" scoped>
@keyframes highlight {
  from {
    background-color: var(--bs-warning);
  }
  to {
    background-color: transparent;
  }
}

.comments-card-list-comment {
  &--highlight {
    animation: highlight 5s linear;
    animation-play-state: initial;
  }

  &:deep(img.emoji) {
    width: auto;
    height: 1em;
    vertical-align: middle;
  }

  &:deep(.meta) {
    display: none;
  }

  &:deep(.quote) {
    margin-bottom: 1rem;
    display: block;

    .title {
      border-left: 5px solid var(--light);
      background-color: var(--lighter);
      color: var(--dark);
      padding: 0.8rem 0.8rem 0px 0.8rem;
    }

    blockquote {
      margin: 0;
      padding: 0.8rem;
      border-left: 5px solid var(--light);
      background-color: var(--lighter);
      clear: both;

      & > :last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
