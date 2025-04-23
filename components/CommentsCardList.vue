<script setup>
import { useTemplateRef, nextTick } from 'vue'

import CommentsCardListComment from './CommentsCardListComment'
import CommentsCardListPlaceholder from './CommentsCardListPlaceholder'

const { virtualComments } = defineProps({
  virtualComments: {
    type: Array,
    required: true
  },
  highlightedCommentId: {
    type: Number,
    default: null
  }
})

defineEmits(['placeholder-visible'])

const element = useTemplateRef('element')

async function scrollToBottom() {
  await nextTick()
  element.value?.scrollTo(0, element.value.scrollHeight)
}

defineExpose({ scrollToBottom })
</script>

<template>
  <div ref="element" class="comments-card-list">
    <template v-for="comment in virtualComments.toReversed()" :key="comment.id">
      <comments-card-list-placeholder
        v-if="comment.placeholder"
        @visible.once="$emit('placeholder-visible', comment)"
      />
      <comments-card-list-comment v-else :comment="comment" :highlight="comment.id === highlightedCommentId" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.comments-card-list {
  max-height: 350px;
  overflow: auto;
  display: flex;
  // This is a trick to ensure the scroll is at the bottom of the list by default. This means
  // comments must be in reverse order in the template.
  flex-direction: column-reverse;
}
</style>
