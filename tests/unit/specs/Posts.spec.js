import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

import Posts from '../../../Posts.vue'

Vue.use(Vuex)
jest.mock('axios')

describe('Posts.vue', () => {
  const state = { document: { idAndRouting: { id: '1' } }, search: { index: 'test-datashare' } }
  const store = new Vuex.Store({ state })
  let wrapper = null

  beforeEach(async () => {
    axios.get.mockResolvedValue(null)
    wrapper = await shallowMount(Posts, { store })
    axios.get.mockClear()
  })

  afterAll(() => jest.unmock('axios'))

  describe('getPosts', () => {
    it('should return empty array if an error occurs', async () => {
      axios.get.mockRejectedValue()
      wrapper = await shallowMount(Posts, { store })
      await wrapper.vm.$nextTick()

      expect(axios.get).toBeCalledTimes(1)
      expect(wrapper.vm.posts).toHaveLength(0)
      expect(wrapper.vm.posts).toEqual([])
    })

    it('should return empty array if no topics', async () => {
      axios.get.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      wrapper = await shallowMount(Posts, { store })
      await wrapper.vm.$nextTick()

      expect(axios.get).toBeCalledTimes(1)
      expect(wrapper.vm.posts).toHaveLength(0)
      expect(wrapper.vm.posts).toEqual([])
    })

    it('should retrieve topics if any', async () => {
      axios.get.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [{ id: 1 }, { id: 2 }] } } } })
      wrapper = await shallowMount(Posts, { store })
      await wrapper.vm.$nextTick()

      expect(axios.get).toBeCalledTimes(1)
      expect(wrapper.vm.posts).toHaveLength(2)
      expect(wrapper.vm.posts).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  describe('getCategory', () => {
    it('should create a category if the search of a category return an error', async () => {
      axios.get.mockRejectedValue()
      const mockFunction = jest.fn().mockResolvedValue({ id: 1 })
      wrapper.vm.createCategory = mockFunction
      const category = await wrapper.vm.getCategory()

      expect(axios.get).toBeCalledTimes(1)
      expect(mockFunction).toBeCalledTimes(1)
      expect(category).toEqual({ id: 1 })
    })

    it('should create a category if the search of a category return null', async () => {
      const mockFunction = jest.fn().mockResolvedValue({ id: 2 })
      wrapper.vm.createCategory = mockFunction
      const category = await wrapper.vm.getCategory()

      expect(axios.get).toBeCalledTimes(1)
      expect(mockFunction).toBeCalledTimes(1)
      expect(category).toEqual({ id: 2 })
    })

    it('should create a category if the search of a category return no category created by Dataconnect', async () => {
      const data = { lists: { category_list: { categories: [{ id: 4 }] } } }
      axios.get.mockResolvedValue({ data })
      const mockFunction = jest.fn().mockResolvedValue({ id: 3 })
      wrapper.vm.createCategory = mockFunction
      const category = await wrapper.vm.getCategory()

      expect(axios.get).toBeCalledTimes(1)
      expect(mockFunction).toBeCalledTimes(1)
      expect(category).toEqual({ id: 3 })
    })

    it('should return an existing category', async () => {
      const data = { lists: { category_list: { categories: [{ id: 5, created_by_dataconnect: true }] } } }
      axios.get.mockResolvedValue({ data })
      const category = await wrapper.vm.getCategory()

      expect(axios.get).toBeCalledTimes(1)
      expect(category).toEqual({ id: 5, created_by_dataconnect: true })
    })
  })

  describe('createCategory', () => {
    it('should creates a category', async () => {
      axios.post.mockResolvedValue({ data: { category: { id: 1 } } })
      const category = await wrapper.vm.createCategory()

      expect(axios.post).toBeCalledTimes(1)
      expect(category).toEqual({ id: 1 })
    })

    it('should return null if an error occurs', async () => {
      axios.post.mockRejectedValue()
      const response = await wrapper.vm.createCategory()

      expect(response).toBeNull()
    })
  })

  describe('createTopicPost', () => {
    beforeEach(async () => {
      axios.post.mockClear()
      wrapper.vm.comment = 'testing comment'
      wrapper.vm.topicResponse = { data: { topic_view_posts: { id: 1 } } }
    })

    it('should return false if an error occurs', async () => {
      axios.post.mockRejectedValue()
      const response = await wrapper.vm.createTopicPost({ id: 1 })

      expect(axios.post).toBeCalledTimes(1)
      expect(response).toBeFalsy()
    })

    it('should create a topic with a post if the topic does not exist', async () => {
      axios.post.mockResolvedValue({})
      wrapper.vm.topicResponse = null
      const response = await wrapper.vm.createTopicPost({ id: 1 })

      expect(axios.post).toBeCalledTimes(1)
      expect(response).toBeTruthy()
    })

    it('should create a post within a topic if the topic exists', async () => {
      axios.post.mockResolvedValue({})
      const response = await wrapper.vm.createTopicPost({ id: 1 })

      expect(axios.post).toBeCalledTimes(1)
      expect(response).toBeTruthy()
    })
  })

  describe('createComment', () => {
    it('should call "createComment" on click', () => {
      wrapper.vm.createComment = jest.fn()
      wrapper.find('button').trigger('click')

      expect(wrapper.vm.createComment).toBeCalled()
    })

    it('should create a comment if topic and category exist', async () => {
      wrapper.vm.getCategory = jest.fn().mockReturnValue({ id: 1 })
      wrapper.vm.createTopicPost = jest.fn().mockReturnValue({ id: 1 })
      axios.get.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      const response = await wrapper.vm.createComment()

      expect(axios.get).toBeCalled()
      expect(response).toBeTruthy()
    })

    it('should create a comment if category exists but topic does not', async () => {
      wrapper.vm.getCategory = jest.fn().mockReturnValue({ id: 1 })
      axios.get.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
      const response = await wrapper.vm.createComment()

      expect(axios.get).toBeCalled()
      expect(axios.post).toBeCalled()
      expect(response).toBeTruthy()
    })

    it('should return false if category does not exist', async () => {
      wrapper.vm.getCategory = jest.fn().mockReturnValue(null)
      const response = await wrapper.vm.createComment()

      expect(axios.get).not.toBeCalled()
      expect(response).toBeFalsy()
    })
  })
})
