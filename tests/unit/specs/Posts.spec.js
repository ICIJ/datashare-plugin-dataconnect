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

  const newCategoryData = {
    category: {
      id: 1,
      name: 'Datashare Documents for test-datashare',
    },
    topic_view_posts: {
      post_stream: {
        posts: []
      }
    }
  }

  const postData = {
    id: 0,
    name: null,
    username: 'currentuser',
    post_type: 1,
    post_number: 1
  }

  const topicResponse = {
    data: {
      topic_view_posts: {
        id: 1,
        post_stream: {
          posts: [
            {
              id: 1,
              username: 'testuser',
              created_at: '2020-10-16T15:21:29.039Z',
              cooked: '<p>trying to see if it creates a topic</p>'
            },
            {
              id: 2,
              username: 'testuser2',
              created_at: '2020-10-16T17:00:29.039Z',
              cooked: '<p>trying to see if it creates a second topic</p>'
            }
          ]
        }
      }
    }
  }

  let wrapper = null

  afterAll(() => jest.unmock('axios'))

  describe('posts', () => {
    it('should retrieve topics if any', async () => {
      const data = {
        topic_view_posts: {
          id: 1,
          post_stream: {
            posts: [
              {
                id: 1,
                username: 'testuser',
                created_at: '2020-10-16T15:21:29.039Z',
                cooked: '<p>trying to see if it creates a topic</p>'
              },
              {
                id: 2,
                username: 'testuser2',
                created_at: '2020-10-16T17:00:29.039Z',
                cooked: '<p>trying to see if it creates a second topic</p>'
              }
            ]
          }
        }
      }
      axios.get.mockResolvedValue({ status: 200, data })
      wrapper = await shallowMount(Posts, { store })
      await wrapper.vm.$nextTick()

      expect(axios.get).toBeCalled()
      expect(wrapper.vm.posts).toEqual(data.topic_view_posts.post_stream.posts)
    })

    it('should return null if no posts', async () => {
      axios.get.mockRejectedValue({ status: 404, data: null })
      wrapper = await shallowMount(Posts, { store })
      await wrapper.vm.$nextTick()

      expect(axios.get).toBeCalled()
      expect(wrapper.vm.posts).toHaveLength(0)
    })
  })

  describe('getCategory', () => {
    beforeEach(async () => {
      axios.get.mockResolvedValue(null)
      wrapper = await shallowMount(Posts, { store })
      axios.get.mockClear()
    })

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
      const data = newCategoryData

      axios.get.mockResolvedValue(null)
      axios.post.mockResolvedValue({ data })
      wrapper = await shallowMount(Posts, { store })
      const response = await wrapper.vm.createCategory()

      expect(axios.post).toBeCalled()
      expect(response).toEqual(data.category)
    })

    describe('error occurs', () => {
      it('returns null', async () => {
        axios.post.mockRejectedValue({ status: 404 })
        wrapper = await shallowMount(Posts, { store })

        const response = await wrapper.vm.createCategory()

        expect(response).toEqual(null)
      })
    })
  })

  describe('createTopicPost', () => {
    it('should create a topic with a post, if the topic does not exist', async () => {
      axios.get.mockResolvedValue(null)
      wrapper = await shallowMount(Posts, { store })

      wrapper.vm.topicResponse = null
      wrapper.vm.comment = 'testing comment'
      axios.post.mockResolvedValue({ status: 200, postData })
      const response = await wrapper.vm.createTopicPost({ id: 1 })

      expect(axios.post).toBeCalled()
      expect(response).toBeTruthy()
    })

    it('should create a post within a topic, if the topic exists', async () => {
      axios.post.mockResolvedValue({ status: 200, postData })
      wrapper = await shallowMount(Posts, { store })

      const text = wrapper.find('textarea')
      await text.setValue('testing comment')
      await wrapper.setData({ topicResponse })

      const response = await wrapper.vm.createTopicPost()

      expect(axios.post).toBeCalled()
      expect(response).toBeTruthy()
    })

    describe('error occurs', () => {
      it('returns false', async () => {
        axios.post.mockRejectedValue({ status: 404 })
        wrapper = await shallowMount(Posts, { store })

        const text = wrapper.find('textarea')
        await text.setValue('testing comment')
        await wrapper.setData({ topicResponse })

        const response = await wrapper.vm.createTopicPost()

        expect(response).toBeFalsy()
      })
    })
  })

  describe('createComment', () => {
    beforeEach(async () => {
      axios.get.mockResolvedValue(null)
      wrapper = await shallowMount(Posts, { store })
    })

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

      expect(axios.get).toBeCalled()
      expect(response).toBeFalsy()
    })
  })
})
