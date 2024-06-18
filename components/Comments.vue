<template>
  <div class="comments">
    <v-wait for="gettingComments">
      <template slot="waiting">
        <b-spinner label="Loading the comments..." class="my-5 mx-auto d-block" />
      </template>
      <comments-list class="comments__list"
                    :comments="virtualComments"
                    :highlighted-comment-id="highlightedCommentId"
                    @comment-placeholder-visible="onCommentPlaceholderVisible" />
      <comments-form class="comments__form" @created="onCreateComment" />
    </v-wait>
  </div>
</template>

<script>
import axios from 'axios'
import { get, flatten, keys, has, range, uniqueId, values } from 'lodash'

import CommentsForm from './CommentsForm.vue'
import CommentsList from './CommentsList.vue'

export default {
  name: 'Comments',
  components: {
    CommentsForm,
    CommentsList
  },
  props: {
    limit: {
      type: Number,
      default: 20
    }
  },
  data () {
    return {
      count: null,
      highlightedCommentId: null,
      pages: {},
      requestedPages: {}
    }
  },
  async mounted () {
    this.$wait.start('gettingComments')
    this.count = await this.getCount()
    await this.getCommentsWithLoading()
  },
  methods: {
    onCommentPlaceholderVisible ({ post_number: postNumber }) {
      const page = Math.ceil(postNumber / this.limit)
      return this.getCommentsOnce(page)
    },
    async onCreateComment ({ id: highlightedCommentId }) {
      this.highlightedCommentId = highlightedCommentId
      this.count = await this.getCount()
      await this.getLastPageComments()
      await this.scrollToLastComment()
     },
    async scrollToLastComment () {
      await this.$nextTick()
      const container = this.$el.closest('.overflow-auto') || window
      const top = container.scrollHeight || document.body.scrollHeight
      container.scrollTo(0, top)
    },
    getLastPageComments () {
      const page = this.estimatedPagesCount
      return this.getComments(page)
    },
    async getCommentsWithLoading (page = 1) {
      this.$wait.start('gettingComments')
      await this.getCommentsOnce(page)
      this.$wait.end('gettingComments')
    },
    async getComments (page = 1) {
      const params = { page, limit: this.limit }
      const url = `custom-fields-api/topics/${this.documentId}.json`
      try {
        const response = await this.sendAction(url, { params })
        const comments = get(response, 'data.topic_view_posts.post_stream.posts', [])
        this.pages[page] = comments
      } catch (_) {
        this.pages[page] = []
      }
      return this.pages[page]
    },
    async getCommentsOnce(page = 1) {
      if (!this.requestedPages[page]) {
        try {
          this.requestedPages[page] = true
          await this.getComments(page)
        } catch (_) {
          delete this.requestedPages[page]
        }
      }
    },
    async getCount () {
      const project = this.project
      const documentId = this.documentId
      try {
        const url = `/api/proxy/${project}/custom-fields-api/topics/${documentId}/posts_count.json`
        const response = await axios.request({ url, method: 'get' })
        return get(response, 'data.posts_count', 0)
      } catch(_) {
        return 0
      }
    },
    async sendAction (url, config = {}) {
      url = `api/proxy/${this.project}/${url}`
      const response = await axios.request({ url, ...config })
      if (has(response, 'data.errors')) {
        throw response.data.errors
      }
      return response
    }
  },
  computed: {
    virtualPages () {
      return range(1, this.estimatedPagesCount + 1).map(page => {
        return this.pages[page] || range(this.limit).map(index => {
          const id = uniqueId('comment-placeholder-')
          const post_number = (page - 1) * this.limit + (index + 1)
          const placeholder = true
          return { placeholder, id, post_number }
        })
      })
    },
    virtualComments () {
      return flatten(values(this.virtualPages))
    },
    comments () {
      return flatten(values(this.pages))
    },
    reachedFinalPage () {
      return this.comments.length >= this.count
    },
    estimatedPagesCount () {
      return this.count ? Math.ceil(this.count / this.limit) : null
    },
    pagesKeys () {
      return keys(this.pages).map(p => parseInt(p))
    },
    project () {
      return this.$store.state.document.idAndRouting.index
    },
    documentId () {
      return this.$store.state.document.idAndRouting.id
    }
  }
}
</script>

<style lang="scss" scoped>
  .comments {

    &__list:empty {
      display: none;
    }

    &__form {
      padding: 1rem;
      background: var(--bs-light);
      position: sticky;
      bottom:0;
      left: 0;
    }
  }
</style>
