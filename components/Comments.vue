<template>
  <div class="comments p-3">
    <comments-form @created="getComments"/>
    <comments-list :comments="comments"/>
  </div>
</template>

<script>
import { get, has, isNull } from 'lodash'
import axios from 'axios'
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
</style>
