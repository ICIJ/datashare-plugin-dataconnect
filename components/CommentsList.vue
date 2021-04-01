<template>
  <div class="comments-list">
    <comment-row v-for="comment in comments" :key="comment.id" :comment="comment" class="comments-list__comment" />
  </div>
</template>

<script>
import CommentRow from './CommentRow'

export default {
  name: 'CommentsList',
  components: {
    CommentRow
  },
  props: {
    comments: {
      type: Array,
      default: () => ([])
    }
  }
}
</script>
