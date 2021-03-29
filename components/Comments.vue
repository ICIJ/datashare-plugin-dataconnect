<template>
  <div class="comments d-flex flex-column h-100 overflow-auto">
    <v-wait for="gettingComments" class="d-flex flex-column h-100 overflow-auto">
      <template slot="waiting">
        <b-spinner label="Loading the comments..." class="my-5 mx-auto d-block" />
      </template>
      <infinite-loading :identifier="infiniteId" @infinite="infiniteHandler" direction="top" v-if="useInfiniteLoading">
        <span slot="spinner" />
        <span slot="no-more" />
        <span slot="no-results" />
      </infinite-loading>
      <comments-list class="comments__list" :comments="comments"></comments-list>
      <comments-form class="comments__form" @created="onCreateComment"></comments-form>
    </v-wait>
  </div>
</template>

<script>
import axios from 'axios'
import { get, flatten, keys, has, max, min, noop, values, uniqueId } from 'lodash'
import InfiniteLoading from 'vue-infinite-loading'

import CommentsForm from './CommentsForm'
import CommentsList from './CommentsList'

export default {
  name: 'Comments',
  components: {
    CommentsForm,
    CommentsList,
    InfiniteLoading
  },
  props: {
    limit: {
      type: Number,
      default: 20
    }
  },
  data () {
    return {
      pages: {},
      project: this.$store.state.search.index,
      documentId: this.$store.state.document.idAndRouting.id,
      infiniteId: uniqueId()
    }
  },
  mounted () {
    this.getCommentsWithLoading()
  },
  methods: {
    async onCreateComment () {
      await this.getNewComment()
      if (this.reachedFinalPage) {
        await this.scrollToLastComment()
      }
     },
    async scrollToLastComment () {
      // Element must be mounted
      await this.$nextTick()
      const container = this.$el.closest('.overflow-auto') || window
      const top = container.scrollHeight || document.body.scrollHeight
      container.scroll({ top, left: 0, behavior: 'smooth' })
    },
    getNewComment () {
      if (this.reachedFinalPage) {
        // Refresh the infinite id to ensure we can load more
        this.infiniteId = uniqueId()
        return this.getCurrentPageComments()
      }
      return this.getNextPageComments()
    },
    getCurrentPageComments () {
      const page = this.pages.length
      return this.getComments({ page })
    },
    getNextPageComments () {
      const page = max(keys(this.pages)) + 1
      return this.getComments({ page })
    },
    getPreviousPageComments () {
      const page = min(keys(this.pages)) - 1
      return this.getComments({ page })
    },
    async getCommentsWithLoading () {
      this.$wait.start('gettingComments')
      const page = Math.ceil(await this.getCount() / this.limit)
      await this.getComments({ page })
      this.$wait.end('gettingComments')
    },
    async getComments ({ page = 1 } = {}) {
      const params = { page, limit: this.limit }
      const url = `custom-fields-api/topics/${this.documentId}.json`
      const response = await this.sendAction(url, { params })
      if (response) {
        const comments = get(response, 'data.topic_view_posts.post_stream.posts', [])
        this.$set(this.pages, page, comments)
      }
      return this.comments
    },
    async getCount () {
      const project = this.project
      const documentId = this.documentId
      const url = `/api/proxy/${project}/custom-fields-api/topics/${documentId}/posts_count.json`
      const response = await axios.request({ url, method: 'get' })
      return get(response, 'data.posts_count', 0)
    },
    async sendAction (url, config = {}) {
      try {
        url = `api/proxy/${this.project}/${url}`
        const response = await axios.request({ url, ...config })
        return has(response, 'data.errors') ? false : response
      } catch (error) {
        return false
      }
    },
    async infiniteHandler ($infiniteLoadingState) {
      await this.getPreviousPageComments()
      // Did we reach the end?
      console.log(this.firstPageKey)
      const method = this.reachedFinalPage ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    }
  },
  computed: {
    comments () {
      return flatten(values(this.pages))
    },
    reachedFinalPage () {
      return this.firstPageKey === 1
    },
    firstPageKey () {
      return min(keys(this.pages).map(parseInt))
    },
    lastPageKey () {
      return max(keys(this.pages).map(parseInt))
    },
    firstPage () {
      return this.pages[this.firstPageKey]
    },
    lastPage () {
      return this.pages[this.lastPageKey]
    },
    useInfiniteLoading () {
      // Do not use infinite loading until the first page is loaded
      return !!keys(this.pages).length
    }
  }
}
</script>

<style lang="scss" scoped>
  .comments {


    &__list {
      padding: 1rem 1rem 0;

      &:empty {
        display: none;
      }
    }

    &__form {
      padding: 1rem;
      background: var(--lighter);
      position: sticky;
      bottom:0;
      left: 0;
    }
  }
</style>
