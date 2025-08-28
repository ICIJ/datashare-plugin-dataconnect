import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { useDocumentComments } from '@/composables/useDocumentComments'
import { createPinia, defineStore, setActivePinia } from "pinia";

const sendAction = vi.fn()

vi.mock('@/composables/useApi', () => {
  return {
    useApi: () => ({ sendAction })
  }
})

vi.mock('@/composables/useCore', () => {
  return {useCore:()=>{return {stores:{useDocumentStore:()=>{return {
          document: {
            id: '1',
            index: 'banana-papers',
            slicedName: ['test.pdf']
          },
          isUserActionVisible: () => true
        }}}}}}
})

describe('useDocumentComments', () => {
  const document = {
    id: 'doc123',
    index: 'test-index',
    slicedName: ['document.pdf']
  }
  let documentComments
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    documentComments = useDocumentComments(document)
    sendAction.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchCommentsCount', () => {
    it('should fetch and set the comments count', async () => {
      sendAction.mockResolvedValueOnce({ posts_count: 5 })

      const { fetchCommentsCount, count } = useDocumentComments(document)

      expect(count.value).toBeNull()

      await fetchCommentsCount()

      expect(sendAction).toHaveBeenCalledWith(
        `/api/proxy/${document.index}/custom-fields-api/topics/${document.id}/posts_count.json`
      )
      expect(count.value).toBe(5)
    })

    it('should set count to 0 if the API request fails', async () => {
      sendAction.mockRejectedValueOnce(new Error('API error'))

      const { fetchCommentsCount, count } = documentComments

      await fetchCommentsCount()

      expect(count.value).toBe(0)
    })
  })



  describe('fetchPage', () => {
    it('should fetch comments for a specific page', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }]
      sendAction.mockResolvedValueOnce({
        topic_view_posts: {
          post_stream: {
            posts: mockPosts
          }
        }
      })

      const { fetchPage } = useDocumentComments(document)

      const result = await fetchPage(1)

      expect(sendAction).toHaveBeenCalledWith(
        `/api/proxy/${document.index}/custom-fields-api/topics/${document.id}.json`,
        { params: { page: 1, limit: 50 } }
      )
      expect(result).toEqual(mockPosts)
    })

    it('should return an empty array if the API request fails', async () => {
      sendAction.mockRejectedValueOnce(new Error('API error'))

      const { fetchPage } = useDocumentComments(document)

      const result = await fetchPage(1)

      expect(result).toEqual([])
    })
  })

  describe('fetchPageOnce', () => {
    it('should fetch a page only once', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }]
      sendAction.mockResolvedValueOnce({
        topic_view_posts: {
          post_stream: {
            posts: mockPosts
          }
        }
      })

      const { fetchPageOnce } = useDocumentComments(document)

      await fetchPageOnce(1)
      await fetchPageOnce(1) // Second call should not trigger another API call

      expect(sendAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('createComment', () => {
    it('should create a comment by appending to an existing topic', async () => {
      // Mock getOrCreateCategory
      sendAction.mockResolvedValueOnce({
        lists: {
          category_list: {
            categories: [{ created_by_dataconnect: true, id: 456 }]
          }
        }
      })

      // Mock fetchTopicId
      sendAction.mockResolvedValueOnce({ topic_view_posts: { id: 123 } })

      // Mock appendToTopic
      sendAction.mockResolvedValueOnce({ success: true })

      const { createComment } = useDocumentComments(document)

      await createComment('Test comment')

      // Check the last call for appendToTopic
      expect(sendAction).toHaveBeenLastCalledWith(
        `/api/proxy/${document.index}/posts.json`,
        {
          method: 'post',
          data: {
            raw: 'Test comment',
            topic_id: 123,
            skip_validations: true
          }
        }
      )
    })

    it('should create a comment by creating a new topic if no topic exists', async () => {
      // Mock getOrCreateCategory
      sendAction.mockResolvedValueOnce({
        lists: {
          category_list: {
            categories: [{ created_by_dataconnect: true, id: 456 }]
          }
        }
      })

      // Mock fetchTopicId (no topic exists)
      sendAction.mockResolvedValueOnce({ topic_view_posts: { id: null } })

      // Mock createTopic
      sendAction.mockResolvedValueOnce({ success: true })

      const { createComment } = useDocumentComments(document)

      await createComment('Test comment')

      // Check the last call for createTopic
      expect(sendAction).toHaveBeenLastCalledWith(
        `/api/proxy/${document.index}/posts.json`,
        {
          method: 'post',
          data: expect.objectContaining({
            raw: expect.stringContaining('Test comment'),
            category: 456,
            datashare_document_id: document.id
          })
        }
      )
    })
  })

  describe('virtualComments', () => {
    it('should generate virtual comments based on count', async () => {
      sendAction.mockResolvedValueOnce({ posts_count: 5 })

      const { fetchCommentsCount, virtualComments } = useDocumentComments(document)

      await fetchCommentsCount()

      expect(virtualComments.value.length).toBe(50)
      expect(virtualComments.value[0]).toHaveProperty('placeholder', true)
      expect(virtualComments.value[0]).toHaveProperty('post_number', 1)
    })
  })

  describe('fetchCommentPage', () => {
    it('should fetch the page containing a specific comment number', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }]
      sendAction.mockResolvedValueOnce({
        topic_view_posts: {
          post_stream: {
            posts: mockPosts
          }
        }
      })

      const { fetchCommentPage } = useDocumentComments(document)

      await fetchCommentPage(75) // This should fetch page 2 (with PAGE_SIZE = 50)

      expect(sendAction).toHaveBeenCalledWith(
        `/api/proxy/${document.index}/custom-fields-api/topics/${document.id}.json`,
        { params: { page: 2, limit: 50 } }
      )
    })
  })

  describe('fetchLastPage', () => {
    it('should fetch the last page of comments', async () => {
      // Set up the count first
      sendAction.mockResolvedValueOnce({ posts_count: 125 })

      const { fetchCommentsCount, fetchLastPage } = useDocumentComments(document)

      await fetchCommentsCount()

      // Reset mock for the fetchLastPage call
      sendAction.mockReset()
      sendAction.mockResolvedValueOnce({
        topic_view_posts: {
          post_stream: {
            posts: [{ id: 121 }, { id: 122 }, { id: 123 }, { id: 124 }, { id: 125 }]
          }
        }
      })

      await fetchLastPage()

      expect(sendAction).toHaveBeenCalledWith(
        `/api/proxy/${document.index}/custom-fields-api/topics/${document.id}.json`,
        { params: { page: 3, limit: 50 } } // With 125 comments and PAGE_SIZE = 50, last page is 3
      )
    })
  })

})
