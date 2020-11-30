<template>
  <div class="posts p-3">
    <div class="posts__actions">
      <div class="posts__actions__form-group">
        <textarea
            class="posts__actions__form-group-textarea form-control rounded-0"
            v-model="comment"
            placeholder="new comment"
        ></textarea>
        <button class="posts__actions__form-group__create btn btn-primary" @click="createComment()">
          Create
        </button>
      </div>
    </div>
    <div v-for="post in posts" :key="post.id" class="posts__post">
      <div class="posts__post__header row">
        <div class="posts__post__header__delete p-2 col-2"></div>
        <div class="posts__post__header__author col-5 font-weight-bold">
          {{ post.username }}
        </div>
        <div class="posts__post__header__date col-5 text-right">
          {{ post.created_at }}
        </div>
      </div>
      <div class="posts__post__text" v-html="post.cooked"></div>
    </div>
  </div>
</template>

<script>
import { filter, get, isNull } from 'lodash'
import axios from 'axios'

export default {
  name: 'Posts',
  data() {
    return {
      comment: '',
      discourseHost: 'http://localhost:8888/api/proxy',
      documentId: this.$store.state.document.idAndRouting.id,
      posts: [],
      project: this.$store.state.search.index,
      topicResponse: null
    }
  },
  async mounted() {
    let topicResponse
    try {
      topicResponse = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
    } catch (err) {
      topicResponse = err.response
    }

    this.$set(this, 'topicResponse', topicResponse)

    if (topicResponse.status != 404) {
      this.$set(this, 'posts', topicResponse.data.topic_view_posts.post_stream.posts)
    }
  },
  methods: {
    async createComment () {
      if (this.topicResponse.status === 404) {
        let category
        category = await this.setCategory()

        if (category != null) {
          let response = await this.createTopic(category.id)

          if (response) {
            await this.setPosts()
          }
        }
      } else if (this.topicResponse.status === 200) {
        let response = await axios.post(`${this.discourseHost}/${this.project}/posts.json`, {raw: this.comment, topic_id: this.topicResponse.data.topic_view_posts.id, skip_validations: "true"})

        if (response.status !== 404) {
          await this.setPosts()
        }
      }
    },
    async setPosts () {
      let response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
      this.$set(this, 'posts', response.data.topic_view_posts.post_stream.posts)
      this.$set(this, 'comment', null)

      return true
    },
    async setCategory () {
      const category = await this.getCategory()
      return isNull(category) ? this.createCategory() : category
    },
    async createCategory () {
      const data = {
        name: `Datashare Documents for ${this.project}`,
        color: 'BF1E2E',
        text_color: 'FFFFFF',
        permissions: {
          [this.project]: 1
        },
        created_by_dataconnect: true
      }
      let response = await axios.post(`${this.discourseHost}/${this.project}/categories.json`, data)
      return response.data
    },
    async getCategory () {
      let categories = await axios.get(`${this.discourseHost}/${this.project}/g/${this.project}/categories.json`)

      const filtered = filter(get(categories, 'data.lists.category_list.categories', []), 'created_by_dataconnect')
      return filtered.length > 0 ? filtered[0] : null
    },
    async createTopic (category_id) {
      let topic = {
            raw: this.comment,
            title: `Datashare document ${this.documentId.substring(0, 7)}`,
            category: category_id.toString(),
            archetype: "regular",
            datashare_document_id: this.documentId,
            skip_validations: true
          }

      let response = await axios.post(`${this.discourseHost}/${this.project}/posts.json`, topic)

      return response.status === 200 ? true : false
    }
  }
}
</script>
