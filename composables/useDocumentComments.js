import { computed, toRef, toValue, reactive } from 'vue'
import { flatten, noop, range, uniqueId, values } from 'lodash'

import { useApi } from '@/composables/useApi'
import { useDocumentCommentsStore } from '@/stores/documentComments'
import { useCore } from './useCore'

/**
 * Composable to handle document's comment.
 *
 * @param {Object} document - The document object or ref containing id and index.
 * @returns {Object} Comment management methods and state.
 */
export function useDocumentComments(document) {
  const PAGE_SIZE = 50

  const documentRef = toRef(document)
  const documentCommentsStore = useDocumentCommentsStore()
  const api = useApi()
  const core = useCore()

  /** Stores comment pages fetched from the API. */
  const pages = reactive({})

  /** Stores promises of ongoing comment page fetch requests. */
  const pagesPromises = reactive({})

  const documentValue = computed(() => toValue(documentRef) ?? null)
  const docId = computed(() => documentValue.value?.id)
  const docIndex = computed(() => documentValue.value?.index)

  /** Computed comment count for the document. */
  const count = computed({
    get() {
      if (!docId.value) {
        return null
      }
      return documentCommentsStore.countByDocument[docId.value] ?? null
    },
    set(value) {
      if (!docId.value) {
        return null
      }
      documentCommentsStore.countByDocument[docId.value] = value
    }
  })

  /** Estimated total number of comment pages. */
  const estimatedPagesCount = computed(() => (count.value ? Math.ceil(count.value / PAGE_SIZE) : null))

  /** Flattened list of virtual comments used in placeholders. */
  const virtualComments = computed(() => flatten(values(virtualPages.value)))

  /** Virtual representation of pages, used to manage placeholders before data loading. */
  const virtualPages = computed(() => {
    return range(1, estimatedPagesCount.value + 1).map((page) => {
      return (
        pages[page] ||
        range(PAGE_SIZE).map((index) => {
          const id = uniqueId('comment-placeholder-')
          const postNumber = (page - 1) * PAGE_SIZE + (index + 1)
          const placeholder = true
          return { placeholder, id, post_number: postNumber }
        })
      )
    })
  })

  /** Link to the document */
  const link = computed(() => {
    const name = 'document-standalone'
    const { routerParams: params } = toValue(documentRef)
    const { href } = core.router.resolve({ name, params })
    const { protocol, host } = window.location
    return `${protocol}//${host}/${href}`
  })

  /**
   * Fetches and sets the total comments count from the API.
   *
   * @returns {Promise<number>} The total number of comments.
   **/
  async function fetchCommentsCount() {
    try {
      if (!docId.value || !docIndex.value) {
        throw Error('Document not found')
      }
      const url = `/api/proxy/${docIndex.value}/custom-fields-api/topics/${docId.value}/posts_count.json`
      const response = await api.sendAction(url)
      count.value = response.posts_count
    } catch {
      count.value = 0
    }
    return count.value
  }

  /**
   * Fetches the topic ID associated with the document.
   *
   * @returns {Promise<number|null>}
   **/
  async function fetchTopicId() {
    if (!docId.value || !docIndex.value) {
      return null
    }
    const url = `/api/proxy/${docIndex.value}/custom-fields-api/topics/${docId.value}.json`
    const response = await api.sendAction(url).catch(noop)
    return response?.topic_view_posts?.id ?? null
  }

  /**
   * Retrieves the category for comments associated with the document's index.
   *
   * @returns {Promise<Object|null>} The category object or null if not found.
   * @throws {Error} If the API request fails.
   **/
  async function getCategory() {
    if (!docIndex.value) {
      return null
    }
    const url = `api/proxy/${docIndex.value}/g/${docIndex.value}/categories.json`
    const response = await api.sendAction(url).catch(noop)
    const categories = response.categories ?? response.lists?.category_list?.categories ?? []
    const dataconnectCategories = categories.filter((category) => category.created_by_dataconnect)
    return dataconnectCategories.shift() ?? null
  }

  /**
   * Creates a category specifically for Datashare documents.
   *
   * @returns {Promise<Object|null>}
   * @throws {Error} If the API request fails.
   **/
  async function createCategory() {
    if (!docIndex.value) {
      return null
    }
    const data = {
      name: `Datashare Documents for ${docIndex.value}`,
      color: 'BF1E2E',
      text_color: 'FFFFFF',
      permissions: {
        [docIndex.value]: 1
      },
      custom_fields: {
        created_by_dataconnect: 'true'
      }
    }

    const url = `/api/proxy/${docIndex.value}/categories.json`
    const response = await api.sendAction(url, { method: 'post', data }).catch(noop)
    return response.category ?? null
  }

  /**
   * Retrieves or creates the appropriate category for the document.
   *
   * @returns {Promise<Object>} The category object.
   * @throws {Error} If the API request fails.
   **/
  async function getOrCreateCategory() {
    return (await getCategory()) || (await createCategory())
  }

  /**
   * Creates a new comment or appends to an existing topic for the document.
   *
   * @param {string} raw - The raw content of the comment.
   * @returns {Promise<Object>} The created or updated comment object.
   * @throws {Error} If the API request fails.
   **/
  async function createComment(raw = '') {
    const { id: category } = await getOrCreateCategory()
    return appendOrCreateTopic({ raw, category, document })
  }

  /**
   * Appends a comment to an existing topic.
   *
   * @param {object} options - Options for appending the comment.
   * @param {string} options.raw - The raw content of the comment.
   * @param {number} options.topicId - The ID of the topic to append to.
   * @returns {Promise<Object>} The updated comment object.
   * @throws {Error} If the API request fails.
   **/
  async function appendToTopic({ raw, topicId } = {}) {
    if (!docIndex.value) {
      return Promise.reject(new Error('Document not found'))
    }
    const url = `/api/proxy/${docIndex.value}/posts.json`
    const data = { raw, topic_id: topicId, skip_validations: true }
    return api.sendAction(url, { method: 'post', data })
  }

  /**
   * Creates a new topic for the document.
   *
   * @param {object} options - Options for creating the topic.
   * @param {string} options.raw - The raw content of the comment.
   * @param {number} options.category - The ID of the category for the topic.
   * @returns {Promise<Object>} The created topic object.
   * @throws {Error} If the API request fails.
   **/
  async function createTopic({ raw, category } = {}) {
    const document = toValue(documentRef)
    const url = `/api/proxy/${document.index}/posts.json`
    const data = {
      raw: raw + `\n\nFind the document here: [${document.title}](${link.value})`,
      title: document.title,
      skip_validations: true,
      category,
      archetype: 'regular',
      datashare_document_id: document.id,
      datashare_document_index: document.index,
      datashare_document_routing: document.routing,
      datashare_document_title: document.title
    }

    return api.sendAction(url, { method: 'post', data })
  }

  /**
   * Determines whether to append to or create a topic based on its existence.
   *
   * @param {object} options - Options for appending or creating the topic.
   * @param {string} options.raw - The raw content of the comment.
   * @param {number} options.category - The ID of the category for the topic.
   * @returns {Promise<Object>} The created or updated topic object.
   * @throws {Error} If the API request fails.
   **/
  async function appendOrCreateTopic({ raw, category } = {}) {
    const topicId = await fetchTopicId()
    return topicId ? appendToTopic({ raw, topicId }) : createTopic({ category, raw })
  }

  /**
   * Fetches the specific comment page containing a given comment number.
   *
   * @param {number} commentNumber - The comment number to fetch.
   * @returns {Promise<void>}
   * @throws {Error} If the API request fails.
   **/
  async function fetchCommentPage(commentNumber) {
    const page = Math.ceil(commentNumber / PAGE_SIZE)
    await fetchPageOnce(page)
  }

  /**
   * Fetches comments for a specific page.
   *
   * @param {number} page - The page number to fetch.
   * @returns {Promise<Array>} The comments for the specified page.
   * @throws {Error} If the API request fails.
   **/
  async function fetchPage(page = 1) {
    if (!docIndex.value || !docId.value) {
      return []
    }
    const url = `/api/proxy/${docIndex.value}/custom-fields-api/topics/${docId.value}.json`
    const params = { page, limit: PAGE_SIZE }
    pagesPromises[page] = api.sendAction(url, { params }).catch(noop)
    pages[page] = (await pagesPromises[page])?.topic_view_posts?.post_stream?.posts ?? []
    return pages[page]
  }

  /**
   * Fetches comments for a page only once to avoid duplicate requests.
   *
   * @param {number} page - The page number to fetch.
   * @returns {Promise<void>}
   * @throws {Error} If the API request fails.
   **/
  async function fetchPageOnce(page = 1) {
    if (page in pagesPromises) return
    await fetchPage(page)
  }

  /**
   * Fetches the last page of comments.
   *
   * @returns {Promise<Array>} The comments for the last page.
   * @throws {Error} If the API request fails.
   **/
  async function fetchLastPage() {
    return fetchPage(estimatedPagesCount.value)
  }

  return {
    count,
    createComment,
    fetchCommentPage,
    fetchCommentsCount,
    fetchPage,
    fetchPageOnce,
    fetchLastPage,
    virtualComments
  }
}
