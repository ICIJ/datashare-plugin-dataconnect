<template>
  <form class="comments-form" @submit.prevent="createCommentWithLoading()">
    <fieldset class="comments-form__fieldset" :disabled="$wait.is('creatingComment')">
      <b-overlay :show="$wait.is('creatingComment')" opacity="0">
          <b-form-textarea        
              class="comments-form__fieldset__fieldset-textarea form-control rounded-0"
              v-model="commentText"
              required
              autofocus
              placeholder="Type your comment here." />
      </b-overlay>
      <div class="d-flex align-items-center">
        <p class="text-muted m-0">
          Your comment with also be visible on the iHub.
        </p>
        <button class="comments-form__fieldset__button btn btn-primary mt-2 ms-auto" type="submit">
          Post
        </button>
      </div>
    </fieldset>
  </form>
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
      project: this.$store.state.document.idAndRouting.index,
      topicId: null
    }
  },
  async mounted () {
    this.commentText = ''
    this.setTopic()
  },
  methods: {
    async setTopic () {
      const response = await this.sendAction(`custom-fields-api/topics/${this.documentId}.json`)
      if (response) {
        this.topicId = get(response, 'data.topic_view_posts.id', null)
      } else {
        this.topicId = null
      }
    },
    async createCommentWithLoading () {
      this.$wait.start('creatingComment')
      await this.createComment()
      this.$wait.end('creatingComment')
    },
    async createComment () {
      const category = await this.getCategory()
      if (category) {
        const response = await this.createTopic(category)
        if (response) {
          this.commentText = ''
          this.$root.$emit('update-tab-label:count')
          this.$emit('created', response.data)

          if (isNull(this.topicId)) {
            this.topicId = get(response, 'data.topic_id', null)
          }
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
      let raw = this.commentText

      if (isNull(this.topicId)) {
        raw = raw + `\n\nFind the document here: [${this.documentName}](${window.location})`
      }

      let data = { raw, skip_validations: true }

      if (!isNull(this.topicId)) {
        data.topic_id = this.topicId
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
      try {
        url = `api/proxy/${this.project}/${url}`
        const response = await axios.request({ url, ...config })
        return has(response, 'data.errors') ? false : response
      } catch (error) {
        return false
      }
    }
  }
}
</script>
