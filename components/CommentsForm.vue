<template>
  <form class="comments-form" @submit.prevent="createCommentWithLoading()">
    <fieldset class="comments-form__fieldset" :disabled="$wait.is('creatingComment')">
      <b-overlay :show="$wait.is('creatingComment')" opacity="0">
          <textarea
              class="comments-form__fieldset__fieldset-textarea form-control rounded-0"
              v-model="commentText"
              required
              placeholder="Type your comment here."></textarea>
      </b-overlay>
      <div class="d-flex align-items-center">
        <p class="text-muted m-0">
          Your comment with also be visible on the iHub.
        </p>
        <button class="comments-form__fieldset__button btn btn-primary mt-2 ml-auto" type="submit">
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
      project: this.$store.state.search.index
    }
  },
  mounted () {
    this.$set(this, 'commentText', '')
  },
  methods: {
    async setTopic () {
      const response = await this.sendAction(`custom-fields-api/topics/${this.documentId}.json`)
      if (response) {
        return get(response, 'data.topic_view_posts.id', null)
      } else {
        return null
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
        const topic = await this.createTopic(category)
        if (topic) {
          this.commentText = ''
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

      const topicId = await this.setTopic()

      if (!isNull(topicId)) {
        data = {
          ...data,
          topic_id: topicId
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
