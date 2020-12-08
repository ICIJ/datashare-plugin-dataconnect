<template>
  <div class="posts p-3">
    <div class="posts__actions">
      <div class="posts__actions__form-group">
        <textarea
            class="posts__actions__form-group-textarea form-control rounded-0"
            v-model="commentText"
            placeholder="Type your comment here."
        ></textarea>
        <button class="posts__actions__form-group__create btn btn-primary" @click="createComment()">
          Create
        </button>
      </div>
    </div>
    <div v-for="comment in comments" :key="comment.id" class="posts__post">
      <div class="posts__post__header row">
        <div class="posts__post__header__delete p-2 col-2"></div>
        <div class="posts__post__header__author col-5 font-weight-bold">
          {{ comment.username }}
        </div>
        <div class="posts__post__header__date col-5 text-right">
          {{ comment.created_at }}
        </div>
      </div>
      <div class="posts__post__text" v-html="comment.cooked"></div>
      <a :href="postUrl(post)">Edit on I-Hub</a>
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
      commentText: '',
      discourseHost: 'http://localhost:8888/api/proxy',
      documentId: this.$store.state.document.idAndRouting.id,
      comments: [],
      project: this.$store.state.search.index,
      topicResponse: null
    }
  },
  mounted () {
    this.getComments()
  },
  methods: {
    postUrl (post) {
      return post.full_url
    },
    async getComments () {
      let response = null
      try {
        response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
      } catch (_) {}
      if (!isNull(response)) {
        this.$set(this, 'topicResponse', response)
        this.$set(this, 'comments', response.data.topic_view_posts.post_stream.posts)
        this.$set(this, 'commentText', '')
        return true
      } else {
        return false
      }
    },
    async createComment () {
      const category = await this.getCategory()
      if (!isNull(category)) {
        const topic = await this.createTopic(category)
        if (!isNull(topic)) {
          return this.getComments()
        }
      }
      return false
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
      let response = null
      try {
        response = await axios.post(`${this.discourseHost}/${this.project}/categories.json`, data)
      } catch(_) {}
      return isNull(response) ? response : response.data.category
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
    async createTopic (category) {
      const topic = this.buildTopic(category)
      let response = null
      try {
        response = await axios.post(`${this.discourseHost}/${this.project}/posts.json`, topic)
      } catch(_) {}
      return !isNull(response)
    },
    buildTopic (category) {
      let topic = null
      if (!isNull(this.topicResponse)) {
        topic = {
          raw: this.commentText,
          topic_id: this.topicResponse.data.topic_view_posts.id,
          skip_validations: true
        }
      } else {
        topic = {
          raw: this.commentText,
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
