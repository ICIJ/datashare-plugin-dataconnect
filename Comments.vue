<template>
  <div class="comments p-3">
    <comments-form></comments-form>

    <div v-for="comment in comments" :key="comment.id" class="comments__comment mt-2 mb-4 p-1">
      <div class="comments__comment__header row no-gutters">
        <div class="comments__comment__header__author col-6 font-weight-bold">
          {{ comment.username }}
        </div>
        <div class="comments__comment__header__date col-6 text-right">
          {{ comment.created_at }}
        </div>
      </div>
      <div class="comments__comment__text" v-html="comment.cooked"></div>
      <a :href="comment.full_url" target="_blank">
        Edit on I-Hub
      </a>
    </div>
  </div>
</template>

<script>
import { get, has, isNull } from 'lodash'
import axios from 'axios'
import CommentsForm from './components/CommentsForm'

export default {
  name: 'Comments',
  components: {
    CommentsForm
  },
  data() {
    return {
      comments: [],
      project: this.$store.state.search.index,
      documentId: this.$store.state.document.idAndRouting.id
    }
  },
  mounted () {
    this.getComments()
  },
  methods: {
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
      let response = null
      try {
        url = `api/proxy/${this.project}/${url}`
        response = await axios.request({ url, ...config })
      } catch (error) {
        // console.log(error)
      }
      return (isNull(response) || has(response, 'data.errors')) ? false : response
    }
  }
}
</script>

<style lang="scss" scoped>
  .comments {
    &__comment {
      border: 1px solid lightgray;
    }
  }
</style>
