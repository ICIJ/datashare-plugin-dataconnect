<template>
  <div class="comments">
    <v-wait for="gettingComments">
      <template slot="waiting">
        <b-spinner label="Loading the comments..." class="my-5 mx-auto d-block" />
      </template>
      <comments-list class="comments__list" :comments="comments"></comments-list>
      <comments-form class="comments__form" @created="onCreateComment"></comments-form>
    </v-wait>
  </div>
</template>

<script>
import axios from 'axios'
import { get, has } from 'lodash'

import CommentsForm from './CommentsForm'
import CommentsList from './CommentsList'

export default {
  name: 'Comments',
  components: {
    CommentsForm,
    CommentsList
  },
  data() {
    return {
      comments: [],
      project: this.$store.state.search.index,
      documentId: this.$store.state.document.idAndRouting.id
    }
  },
  mounted () {
    this.getCommentsWithLoading()
  },
  methods: {
    async onCreateComment () {
      await this.getComments()
      await this.scrollToLastComment()
     },
    async scrollToLastComment () {
      // Element must be mounted
      await this.$nextTick()
      // Use the last comment
      let comment = this.$el.querySelector('.comments-list__comment:last-of-type')
      // Get the offset from the navbar height (which is sticky)
      const offset = -parseInt(this.$root.$el.style.getPropertyValue('--search-document-navbar-height'))
      // Use the scroll-tracker component
      const $container = this.$el.closest('.overflow-auto')
      // eslint-disable-next-line vue/custom-event-name-casing
      this.$root.$emit('scroll-tracker:request', comment, offset, $container)
    },
    async getCommentsWithLoading () {
      this.$wait.start('gettingComments')
      await this.getComments()
      this.$wait.end('gettingComments')
    },
    async getComments () {
      const response = await this.sendAction(`custom-fields-api/topics/${this.documentId}.json`)
      if (response) {
        this.$set(this, 'comments', get(response, 'data.topic_view_posts.post_stream.posts', []))
      } else {
        this.$set(this, 'comments', [])
      }
      return this.comments
    },
    async sendAction (url, config = {}) {
      try {
        url = `api/proxy/${this.project}/${url}`
        const response = await axios.request({ url, ...config })
        return has(response, 'data.errors') ? false : response
      } catch (error) {
        return false
      }
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
