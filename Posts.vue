<template>
  <div class="posts p-3">
    <div class="posts__actions">
      <div class="posts__actions__form-group">
        <textarea
            class="posts__actions__form-group-textarea form-control rounded-0"
            v-model="comment"
            placeholder="new comment"
        ></textarea>
        <button class="posts__actions__form-group__create btn btn-primary mt-2" @click="createComment()">
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
      topicResponse: null
    }
  },
  async mounted () {
    let response = null
    try {
      response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
    } catch (_) {}
    this.$set(this, 'topicResponse', response)
    if (!isNull(this.topicResponse)) {
      this.$set(this, 'posts', this.topicResponse.data.topic_view_posts.post_stream.posts)
    }
  },
  methods: {
    async createComment () {
      const category = await this.getCategory()
      let topicPostResponse = null
      if (category != null) {
        topicPostResponse = await this.createTopicPost(category)
      }
      if (!isNull(topicPostResponse) || topicPostResponse) {
        return this.setPosts()
      } else {
        return false
      }
    },
    async setPosts () {
      let response = null
      try {
        response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
      } catch(_) {}
      if (!isNull(response)) {
        this.$set(this, 'posts', response.data.topic_view_posts.post_stream.posts)
        this.$set(this, 'comment', null)
        this.$set(this, 'topicResponse', response)
        return true
      } else {
        return false
      }
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
      let category = null
      try {
        category = await axios.post(`${this.discourseHost}/${this.project}/categories.json`, data)
      } catch(_) {}
      return isNull(category) ? category : category.data.category
    },
    async getCategory () {
      let category = null
      try {
        const categories = await axios.get(`${this.discourseHost}/${this.project}/g/${this.project}/categories.json`)
        const filtered = filter(get(categories, 'data.lists.category_list.categories', []), 'created_by_dataconnect')
        category = get(filtered, '0', null)
      } catch(_) {}
      if (isNull(category)) {
        category = await this.createCategory()
      }
      return category
    },
    async createTopicPost (category) {
      const topic = this.buildTopic(category)
      let response = null
      try {
        response = await axios.post(`${this.discourseHost}/${this.project}/posts.json`, topic)
      } catch(_) {}
      return !isNull(response)
    },
    buildTopic (category) {
      const topicExists = !isNull(this.topicResponse)
      let topic = null
      if (topicExists) {
        topic = {
          raw: this.comment,
          topic_id: this.topicResponse.data.topic_view_posts.id,
          skip_validations: true
        }
      } else {
        topic = {
          raw: this.comment,
          title: `Datashare document ${this.documentId.substring(0, 7)}`,
          category: category.id,
          archetype: 'regular',
          datashare_document_id: this.documentId,
          skip_validations: true
        }
      }
      return topic
    }
  }
}
</script>
