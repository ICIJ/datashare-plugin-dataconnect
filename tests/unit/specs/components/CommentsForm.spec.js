import { shallowMount } from '@vue/test-utils'
import axios from 'axios'

import CorePlugin from '../../CorePlugin.js'
import CommentsForm from '@components/CommentsForm.vue'

vi.mock('axios')

describe('CommentsForm.vue', () => {
  let wrapper

  function createContainer() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    return div
  }

  beforeEach(async () => {
    const attachTo = createContainer()
    const { plugins, stubs } = CorePlugin.init()
    wrapper = await shallowMount(CommentsForm, { attachTo, global: { plugins, stubs } })
    axios.request.mockClear()
  })

  afterEach(() => {
    axios.request.mockReset()
  })

  describe('setTopic', () => {
    it('should set the topicId, if the topic exists', async () => {
      axios.request.mockResolvedValue({ data: { topic_view_posts: { id: 1 } } })

      await wrapper.vm.setTopic()
      expect(axios.request).toBeCalledTimes(1)
      expect(wrapper.vm.topicId).toBe(1)
    })

    it('should keep topicId null, if topic does not exist', async () => {
      axios.request.mockResolvedValue(null)

      await wrapper.vm.setTopic()
      expect(axios.request).toBeCalledTimes(1)
      expect(wrapper.vm.topicId).toBeNull()
    })
  })

  describe('getCategory', () => {
    it('should not get either create a category if the search of a category returns an error', async () => {
      axios.request.mockRejectedValue()
      const category = await wrapper.vm.getCategory()

      expect(axios.request).toBeCalledTimes(1)
      expect(category).toBeNull()
    })

    it('should create a category if the search of a category returns null', async () => {
      axios.request.mockResolvedValue({})
      const mockFunction = vi.fn().mockResolvedValue({ id: 2 })
      wrapper.vm.createCategory = mockFunction
      const category = await wrapper.vm.getCategory()

      expect(axios.request).toBeCalledTimes(1)
      expect(mockFunction).toBeCalledTimes(1)
      expect(category).toEqual({ id: 2 })
    })

    it('should create a category if the search of a category return no category created by Dataconnect', async () => {
      const data = { lists: { category_list: { categories: [{ id: 4 }] } }, category: { id: 3 } }
      axios.request.mockResolvedValue({ data })
      const category = await wrapper.vm.getCategory()

      expect(axios.request).toBeCalledTimes(2)
      expect(category).toEqual({ id: 3 })
    })

    it('should return an existing category', async () => {
      const data = { lists: { category_list: { categories: [{ id: 5, created_by_dataconnect: 'true' }] } } }
      axios.request.mockResolvedValue({ data })
      const category = await wrapper.vm.getCategory()

      expect(axios.request).toBeCalledTimes(1)
      expect(category).toEqual({ id: 5, created_by_dataconnect: 'true' })
    })
  })

  describe('createCategory', () => {
    it('should creates a category', async () => {
      axios.request.mockResolvedValue({ data: { category: { id: 1 } } })
      const category = await wrapper.vm.createCategory()

      expect(axios.request).toBeCalledTimes(1)
      expect(category).toEqual({ id: 1 })
    })

    it('should return null if an error occurs', async () => {
      axios.request.mockRejectedValue()
      const response = await wrapper.vm.createCategory()

      expect(response).toBeNull()
    })
  })

  describe('createTopic', () => {
    beforeEach(async () => {
      axios.request.mockClear()
      wrapper.setData({ commentText: 'testing comment' })
      wrapper.setData({ topicId: 1 })
    })

    it('should return false if an error occurs', async () => {
      axios.request.mockRejectedValue()
      const response = await wrapper.vm.createTopic({ id: 1 })

      expect(axios.request).toBeCalledTimes(1)
      expect(response).toBeFalsy()
    })

    it('should create a topic with a post if the topic does not exist', async () => {
      axios.request.mockResolvedValue({})
      wrapper.setData({ topicId: null })
      const response = await wrapper.vm.createTopic({ id: 1 })

      expect(axios.request).toBeCalledTimes(1)
      expect(response).toBeTruthy()
    })

    it('should create a post within a topic if the topic exists', async () => {
      axios.request.mockResolvedValue({})
      const response = await wrapper.vm.createTopic({ id: 1 })

      expect(axios.request).toBeCalledTimes(1)
      expect(response).toBeTruthy()
    })
  })

  describe('createComment', () => {
    it('should call "createCommentWithLoading" on submit', async () => {
      await wrapper.setData({ commentText: 'testing comment' })
      wrapper.vm.createCommentWithLoading = vi.fn()
      wrapper.find('.comments-form').trigger('submit')

      expect(wrapper.vm.createCommentWithLoading).toBeCalled()
    })

    it('should return false if category does not exist', async () => {
      wrapper.vm.getCategory = vi.fn().mockReturnValue(null)
      const response = await wrapper.vm.createComment()

      expect(axios.request).not.toBeCalled()
      expect(response).toBeFalsy()
    })

    it('should create a comment if topic and category exist', async () => {
      wrapper.vm.getCategory = vi.fn().mockReturnValue({ id: 1 })
      wrapper.vm.createTopic = vi.fn().mockReturnValue({ id: 1 })
      axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })

      await wrapper.vm.createComment()

      expect(wrapper.emitted().created).toBeTruthy()
    })

    it('should create a comment if category exists but topic does not', async () => {
      wrapper.vm.getCategory = vi.fn().mockReturnValue({ id: 1 })
      axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      await wrapper.vm.createComment()

      expect(axios.request).toBeCalledTimes(1)
      expect(wrapper.emitted().created).toBeTruthy()
    })
  })
})
