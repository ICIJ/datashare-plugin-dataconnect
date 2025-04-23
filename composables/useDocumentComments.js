import { computed, toRef, toValue, reactive } from 'vue'
import { flatten, noop, range, uniqueId, values } from 'lodash'

import { useApi } from '@/composables/useApi'
import { useDocumentCommentsStore } from '@/stores/documentComments'

export function useDocumentComments(document) {
  const PAGE_SIZE = 50

  const documentRef = toRef(document)
  const documentCommentsStore = useDocumentCommentsStore()
  const api = useApi()

  const pages = reactive({})
  const pagesPromises = reactive({})

  const count = computed({
    get() {
      const { id } = toValue(documentRef)
      return documentCommentsStore.countByDocument[id] ?? null
    },
    set(value) {
      const { id } = toValue(documentRef)
      documentCommentsStore.countByDocument[id] = value
    }
  })

  const estimatedPagesCount = computed(() => (count.value ? Math.ceil(count.value / PAGE_SIZE) : null))
  const virtualComments = computed(() => flatten(values(virtualPages.value)))

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

  async function fetchCommentsCount() {
    try {
      const { id, index } = toValue(documentRef)
      const url = `/api/proxy/${index}/custom-fields-api/topics/${id}/posts_count.json`
      const response = await api.sendAction(url)
      count.value = response.posts_count
    } catch {
      count.value = 0
    }
    return count.value
  }

  async function fetchTopicId() {
    const { id, index } = toValue(documentRef)
    const url = `/api/proxy/${index}/custom-fields-api/topics/${id}.json`
    const response = await api.sendAction(url).catch(noop)
    return response?.topic_view_posts?.id ?? null
  }

  async function getCategory() {
    const { index } = toValue(documentRef)
    const url = `api/proxy/${index}/g/${index}/categories.json`
    const response = await api.sendAction(url).catch(noop)
    const categories = response.lists?.category_list?.categories ?? []
    const dataconnectCategories = categories.filter((category) => category.created_by_dataconnect)
    return dataconnectCategories.shift() ?? null
  }

  async function createCategory() {
    const { index } = toValue(documentRef)
    const data = {
      name: `Datashare Documents for ${index}`,
      color: 'BF1E2E',
      text_color: 'FFFFFF',
      permissions: {
        [index]: 1
      },
      custom_fields: {
        created_by_dataconnect: 'true'
      }
    }

    const url = `/api/proxy/${index}/categories.json`
    const response = await api.sendAction(url, { method: 'post', data })
    return response.category ?? null
  }

  async function getOrCreateCategory() {
    const { id, index } = toValue(documentRef)
    return (await getCategory({ index })) || (await createCategory({ id, index }))
  }

  async function createComment(raw = '') {
    const document = toValue(documentRef)
    const { id: category } = await getOrCreateCategory(document)
    return appendOrCreateTopic({ raw, category, document })
  }

  async function appendToTopic({ raw, topicId } = {}) {
    const document = toValue(documentRef)
    const url = `/api/proxy/${document.index}/posts.json`
    const data = { raw, topic_id: topicId, skip_validations: true }
    return api.sendAction(url, { method: 'post', data })
  }

  async function createTopic({ raw, category } = {}) {
    const document = toValue(documentRef)
    const documentName = document.slicedName[document.slicedName.length - 1]
    const url = `/api/proxy/${document.index}/posts.json`
    const data = {
      raw: raw + `\n\nFind the document here: [${documentName}](${window.location})`,
      skip_validations: true,
      title: `${documentName} - #${document.id.substring(0, 7)}`,
      category,
      archetype: 'regular',
      datashare_document_id: document.id
    }

    return api.sendAction(url, { method: 'post', data })
  }

  async function appendOrCreateTopic({ raw, category } = {}) {
    const topicId = await fetchTopicId()
    if (topicId) {
      return appendToTopic({ raw, topicId })
    } else {
      return createTopic({ category, raw })
    }
  }

  async function fetchCommentPage(commentNumber) {
    const page = Math.ceil(commentNumber / PAGE_SIZE)
    await fetchPageOnce(page)
  }

  async function fetchPage(page = 1) {
    const params = { page, limit: PAGE_SIZE }
    const { id, index } = toValue(documentRef)
    const url = `/api/proxy/${index}/custom-fields-api/topics/${id}.json`
    // We store the promise in the pagesPromises object to avoid concurent requests for the same page.
    pagesPromises[page] = api.sendAction(url, { params }).catch(noop)
    pages[page] = (await pagesPromises[page])?.topic_view_posts?.post_stream?.posts ?? []
    return pages[page]
  }

  async function fetchPageOnce(page = 1) {
    if (page in pagesPromises) return
    await fetchPage(page)
  }

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
