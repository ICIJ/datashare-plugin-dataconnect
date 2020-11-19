<template>
  <div class="posts p-3">
    <div class="posts__actions">
      <div class="posts__actions__form-group">
        <textarea class="posts__actions__form-group-textarea form-control rounded-0" v-model="comment"
                  placeholder="new comment"></textarea>
        <button class="posts__actions__form-group__create btn btn-primary">Create</button>
      </div>
    </div>
    <div v-for="post in posts" :key="post.id" class="posts__post">
      <div class="posts__post__header row">
        <div class="posts__post__header__delete p-2 col-2">
        </div>
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
import filter from 'lodash/filter'
import axios from 'axios'

export default {
  name: 'Posts',
  data() {
    return {
      posts: [],
      comment: "",
      discourseHost: 'http://localhost:8888/api/proxy',
      topicResponse: null
    }
  },
  async mounted() {
    const documentId = this.$store.state.document.idAndRouting.id
    const project = this.$store.state.search.index
    let topicResponse = await axios.get(`${this.discourseHost}/${project}/custom-fields-api/topics/${documentId}.json`)

    if (topicResponse.status !== 404) {
      this.$set(this, 'topicResponse', topicResponse)
      this.$set(this, 'posts', topicResponse.data.post_stream.posts)
    }
  },
  methods: {
    async createCategory() {
      const currentDsProject = this.$store.state.search.index

      let permissions = {}
      permissions[currentDsProject] = "1"
      let data = {
        name: `Datashare Documents for ${currentDsProject}`,
        color: "BF1E2E",
        text_color: "FFFFFF",
        permissions: permissions,
        created_by_dataconnect: "true"
      }

      const axiosResponse = await axios.post(`${this.discourseHost}/${currentDsProject}/categories.json`, data);
      return axiosResponse.data
    },

    async getCategory() {
      const currentDsProject = this.$store.state.search.index
      let categories = await axios.get(`${this.discourseHost}/${currentDsProject}/categories.json`)

      categories = categories.data.category_list.categories || []

      let filtered = filter(categories, function (o) {
        return (o.created_by_dataconnect)
      })

      return filtered.length > 0 ? filtered[0]: null
    }
  }
}
</script>
