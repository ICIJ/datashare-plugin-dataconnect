<template>
  <div class="comments p-3">
    <div class="comments__actions">
      <div class="comments__actions__form">
        <textarea
            class="comments__actions__form-textarea form-control rounded-0"
            v-model="commentText"
            placeholder="Type your comment here."
        ></textarea>
        <button class="comments__actions__form__button btn btn-primary mt-2" @click="createComment()">
          Create
        </button>
      </div>
    </div>
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
      <a :href="comment.full_url">
        Edit on I-Hub
      </a>
    </div>
  </div>
</template>

<script>
import { filter, get, has, isNull } from 'lodash'
import axios from 'axios'

export default {
  name: 'Posts',
  data() {
    return {
      comments: [],
      commentText: '',
      discourseHost: 'http://localhost:8888/api/proxy',
      documentId: this.$store.state.document.idAndRouting.id,
      project: this.$store.state.search.index,
      topicId: null
    }
  },
  mounted () {
    this.getComments()
  },
  methods: {
    async getComments () {
      let response = null
      try {
        response = await this.sendAction(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${this.documentId}.json`)
      } catch (_) {}
      if (!isNull(response)) {
        this.$set(this, 'topicId', get(response, 'data.topic_view_posts.id', null))
        this.$set(this, 'comments', get(response, 'data.topic_view_posts.post_stream.posts', []))
        this.$set(this, 'commentText', '')
      }
      return this.comments
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
      let category = null
      try {
        const response = await this.sendAction(`${this.discourseHost}/${this.project}/categories.json`, { method: 'post', data })
        category = get(response, 'data.category', null)
      } catch(_) {}
      return category
    },
    async getCategory () {
      let category = null
      try {
        const categories = await this.sendAction(`${this.discourseHost}/${this.project}/g/${this.project}/categories.json`)
        const categoriesCreatedByDataconnect = filter(get(categories, 'data.lists.category_list.categories', []), 'created_by_dataconnect')
        category = get(categoriesCreatedByDataconnect, '0', null)
      } catch(_) {}
      // If category does not exist, create one
      if (isNull(category)) {
        category = await this.createCategory()
      }
      return category
    },
    async createTopic (category) {
      let data = {
        raw: this.commentText,
        skip_validations: true
      }
      if (!isNull(this.topicId)) {
        data = {
          ...data,
          topic_id: this.topicId
        }
      } else {
        data = {
          ...data,
          title: `Datashare document ${this.documentId.substring(0, 7)}`,
          category: category.id,
          archetype: 'regular',
          datashare_document_id: this.documentId
        }
      }
      const response = await this.sendAction(`${this.discourseHost}/${this.project}/posts.json`, { method: 'post', data })
      return !isNull(response)
    },
    async sendAction (url, config = {}) {
      let response = null
      try {
        response = await axios.request({ url, ...config })
      } catch (_) {}
      if (isNull(response) || has(response.data, 'errors')) {
        return null
      } else {
        return response
      }
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
