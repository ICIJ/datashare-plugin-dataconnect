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
      topicExists: null,
      topicResponse: null,
      categoryId: null
    }
  },
  async mounted() {
    let response

    try {
      response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
    } catch (err) {
      response = null
    }

    this.$set(this, 'topicResponse', response)

    if (this.topicResponse != null) {
      this.$set(this, 'posts', this.topicResponse.data.topic_view_posts.post_stream.posts)
    }
  },
  methods: {
    async createComment () {
      const category = await this.setCategory()

      if (category != null) {
        this.$set(this, 'categoryId', category.id)
      }

      const topicPostResponse = await this.createTopicPost()

      if (topicPostResponse != null) {
        return await this.setPosts()
      } else {
        return false
      }
    },

    async setPosts () {
      let response

      try {
        response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
      } catch(error) {
        response = null
      }

      if (response != null) {
        this.$set(this, 'posts', response.data.topic_view_posts.post_stream.posts)
        this.$set(this, 'comment', null)
        this.$set(this, 'topicResponse', response)

        return true
      } else if (isNull(response)) {
        return false
      }
    },

    async setCategory () {
      const category = await this.getCategory()
      return isNull(category) ? this.createCategory() : category
    },

    async createCategory () {
      const data = this.buildCategory()

      let category

      try {
        category = await axios.post(`${this.discourseHost}/${this.project}/categories.json`, data)
      } catch(error) {
        category = null
      }

      return isNull(category) ? category : category.data.category
    },

    async getCategory () {
      let categories

      try {
        categories = await axios.get(`${this.discourseHost}/${this.project}/g/${this.project}/categories.json`)
      } catch(error) {
        categories = null
      }

      const filtered = filter(get(categories, 'data.lists.category_list.categories', []), 'created_by_dataconnect')

      return filtered.length > 0 ? filtered[0] : null
    },

    async createTopicPost () {
      const topic = this.buildTopic()

      let response

      try {
        response = await axios.post(`${this.discourseHost}/${this.project}/posts.json`, topic)
      } catch(error) {
        response = null
      }

      return isNull(response) ? false : true
    },

    buildTopic () {
      const topicExists = !isNull(this.topicResponse)

      let topic

      if (topicExists) {
        topic = {
          raw: this.comment,
          topic_id: this.topicResponse.data.topic_view_posts.id,
          skip_validations: "true"
        }
      } else {
        topic = {
              raw: this.comment,
              title: `Datashare document ${this.documentId.substring(0, 7)}`,
              category: this.categoryId.toString(),
              archetype: "regular",
              datashare_document_id: this.documentId,
              skip_validations: "true"
          }
      }

      return topic
    },

    buildCategory () {
      const data = {
        name: `Datashare Documents for ${this.project}`,
        color: 'BF1E2E',
        text_color: 'FFFFFF',
        permissions: {
          [this.project]: 1
        },
        created_by_dataconnect: "true"
      }

      return data
    }
  }
}
</script>
