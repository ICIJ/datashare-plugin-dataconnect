<template>
  <div class="comments-form">
    <div class="comments-form__form">
      <textarea
          class="comments-form__form__form-textarea form-control rounded-0"
          v-model="commentText"
          placeholder="Type your comment here."
      ></textarea>
      <button class="comments-form__form__button btn btn-primary mt-2" @click="createComment()">
        Create
      </button>
    </div>
  </div>
</template>

<script>
import { filter, get, has, isNull, last } from 'lodash'
import axios from 'axios'

export default {
  name: 'CommentsForm',
  data() {
    return {
      commentText: '',
      documentId: this.$store.state.document.idAndRouting.id,
      documentName: last(this.$store.state.document.doc.slicedName),
      project: this.$store.state.search.index,
      topicId: null
    }
  },
  mounted () {
    this.setTopic()
  },
  methods: {
    async setTopic () {
      const response = await this.sendAction(`custom-fields-api/topics/${this.documentId}.json`)
      if (response) {
        this.$set(this, 'topicId', get(response, 'data.topic_view_posts.id', null))
      } else {
        this.$set(this, 'topicId', null)
      }
      this.$set(this, 'commentText', '')
    },
    async createComment () {
      const category = await this.getCategory()
      if (category) {
        const topic = await this.createTopic(category)
        if (topic) {
          this.$root.$emit('update-tab-label:count')
          this.$emit('created')
        }
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
        custom_fields: {
          created_by_dataconnect: 'true'
        }
      }
      const response = await this.sendAction('categories.json', { method: 'post', data })
      return response ? get(response, 'data.category', null) : null
    },
    async getCategory () {
      let category = null
      const response = await this.sendAction(`g/${this.project}/categories.json`)
      if (response) {
        const categoriesCreatedByDataconnect = filter(get(response, 'data.lists.category_list.categories', []), 'created_by_dataconnect')
        category = get(categoriesCreatedByDataconnect, '0', null)
        // If category does not exist, create one
        if (isNull(category)) {
          category = await this.createCategory()
        }
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
          title: `${this.documentName} - #${this.documentId.substring(0, 7)}`,
          category: category.id,
          archetype: 'regular',
          datashare_document_id: this.documentId
        }
      }
      return this.sendAction('posts.json', { method: 'post', data })
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

<style lang="css" scoped>
</style>
