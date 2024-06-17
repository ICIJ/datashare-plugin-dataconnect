<template>
  <span class="comments-tab-label">
    <span class="comments-tab-label__label">
      Comments
    </span>
    <sup class="comments-tab-label__count badge badge-secondary" v-html="count" v-if="count > 0"></sup>
  </span>
</template>

<script>
  import { get } from 'lodash'
  import axios from 'axios'

  export default {
    name: 'CommentsTabLabel',
    data () {
      return {
        count: null
      }
    },
    mounted () {
      this.$core.on("update-tab-label:count", () => this.initCount())
      this.initCount()
    },
    computed: {
      document () {
        return this.$store.state.document.doc
      },
      documentId () {
        return this.document.id
      },
      project () {
        return this.$store.state.search.index
      }
    },
    watch: {
      documentId () {
        return this.initCount()
      }
    },
    methods:  {
      async initCount () {
        if (this.documentId) {
          try {
            this.count = await this.getCount()
          } catch (_) {
            this.count = null
          }
        }
      },
      async getCount () {
        const project = this.project
        const documentId = this.documentId
        const url = `/api/proxy/${project}/custom-fields-api/topics/${documentId}/posts_count.json`
        const response = await axios.request({ url, method: 'get' })
        return get(response, 'data.posts_count', 0)
      }
    }
  }
</script>
