import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

import Posts from '../../../Posts.vue'

Vue.use(Vuex)
jest.mock('axios')

describe('Posts.vue', () => {
  const state = { document: { doc: { slicedName: 'test.pdf' }, idAndRouting: { id: '1' } }, search: { index: 'test-datashare' } }
  const store = new Vuex.Store({ state })
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(Posts, { store })
    axios.request.mockClear()
  })

  afterAll(() => jest.unmock('axios'))

  describe('getComments', () => {
    it('should return empty array if an error occurs', async () => {
      axios.request.mockRejectedValue()
      await wrapper.vm.getComments()

      expect(axios.request).toBeCalledTimes(1)
      expect(wrapper.vm.comments).toHaveLength(0)
      expect(wrapper.vm.comments).toEqual([])
    })

    it('should return empty array if no topics', async () => {
      wrapper.vm.comments = [{ id: 1 }]
      axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      await wrapper.vm.getComments()

      expect(axios.request).toBeCalledTimes(1)
      expect(wrapper.vm.comments).toHaveLength(0)
      expect(wrapper.vm.comments).toEqual([])
    })

    it('should retrieve topics if any', async () => {
      axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [{ id: 1 }, { id: 2 }] } } } })
      await wrapper.vm.getComments()

      expect(axios.request).toBeCalledTimes(1)
      expect(wrapper.vm.comments).toHaveLength(2)
      expect(wrapper.vm.comments).toEqual([{ id: 1 }, { id: 2 }])
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
      const mockFunction = jest.fn().mockResolvedValue({ id: 2 })
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
      wrapper.vm.commentText = 'testing comment'
      wrapper.vm.topicId = 1
    })

    it('should return false if an error occurs', async () => {
      axios.request.mockRejectedValue()
      const response = await wrapper.vm.createTopic({ id: 1 })

      expect(axios.request).toBeCalledTimes(1)
      expect(response).toBeFalsy()
    })

    it('should create a topic with a post if the topic does not exist', async () => {
      axios.request.mockResolvedValue({})
      wrapper.vm.topicId = null
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
    it('should call "createComment" on click', () => {
      wrapper.vm.createComment = jest.fn()
      wrapper.find('button').trigger('click')

      expect(wrapper.vm.createComment).toBeCalled()
    })

    it('should return false if category does not exist', async () => {
      wrapper.vm.getCategory = jest.fn().mockReturnValue(null)
      const response = await wrapper.vm.createComment()

      expect(axios.request).not.toBeCalled()
      expect(response).toBeFalsy()
    })

    it('should create a comment if topic and category exist', async () => {
      wrapper.vm.getCategory = jest.fn().mockReturnValue({ id: 1 })
      wrapper.vm.createTopic = jest.fn().mockReturnValue({ id: 1 })
      axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      const response = await wrapper.vm.createComment()

      expect(axios.request).toBeCalled()
      expect(response).toBeTruthy()
    })

    it('should create a comment if category exists but topic does not', async () => {
      wrapper.vm.getCategory = jest.fn().mockReturnValue({ id: 1 })
      axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      const response = await wrapper.vm.createComment()

      expect(axios.request).toBeCalledTimes(2)
      expect(response).toBeTruthy()
    })
  })
})
