<template>
  <div class="comments-list">
    <dynamic-scroller :items="comments" :min-item-size="85" page-mode>
      <template v-slot="{ item, index, active }">
        <dynamic-scroller-item :item="item" :active="active" :size-dependencies="[ item.cooked, ]" :data-index="index">
          <component :is="commentComponent(item)"
                     :comment="item" class="comments-list__comment"
                     :highlight="highlightedCommentId === item.id"
                     @visible="onCommentPlaceholderVisible" />
        </dynamic-scroller-item>
      </template>
    </dynamic-scroller>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import CommentPlaceholder from './CommentPlaceholder.vue'
import CommentRow from './CommentRow.vue'

export default {
  name: 'CommentsList',
  components: {
    DynamicScroller,
    DynamicScrollerItem
  },
  props: {
    comments: {
      type: Array,
      default: () => ([])
    },
    highlightedCommentId: {
      type: Number,
      default: null
    }
  },
  methods: {
    onCommentPlaceholderVisible (comment) {
      this.$emit('comment-placeholder-visible', comment)
    },
    commentComponent ({ placeholder }) {
      return placeholder ? CommentPlaceholder : CommentRow
    }
  }
}
</script>
