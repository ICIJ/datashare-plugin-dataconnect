<template>
  <div class="posts p-3">
    <div class="posts__actions">
      <div class="posts__actions__form-group">
        <textarea
            class="posts__actions__form-group-textarea form-control rounded-0"
            v-model="comment"
            placeholder="new comment"
        ></textarea>
        <button class="posts__actions__form-group__create btn btn-primary">
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
      project: this.$store.state.search.index
    }
  },
  async mounted() {
    const documentId = this.$store.state.document.idAndRouting.id
    const response = await axios.get(`${this.discourseHost}/${this.project}/custom-fields-api/topics/${documentId}.json`)
    if (response.status !== 404) {
      this.$set(this, 'posts', response.data.post_stream.posts)
    }
  },
  methods: {
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
          'local-datashare': 1
        },
        created_by_dataconnect: true
      }
      const response = await axios.post(`${this.discourseHost}/${this.project}/categories.json`, data)
      return response.data
    },
    async getCategory () {
      const categories = await axios.get(`${this.discourseHost}/${this.project}/categories.json`)
      const filtered = filter(get(categories, 'data.category_list.categories', []), 'created_by_dataconnect')
      return filtered.length > 0 ? filtered[0] : null
    }
  }
}
</script>
