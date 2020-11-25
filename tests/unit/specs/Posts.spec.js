import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

import Posts from '../../../Posts.vue'

Vue.use(Vuex)
jest.mock('axios')

describe('Posts.vue', () => {
  const state = { document: { idAndRouting: { id: 1 } }, search: { index: 'test-datashare' } }
  const store = new Vuex.Store({ state })
  let wrapper = null

  afterAll(() => jest.unmock('axios'))

  describe('topics', () => {
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

    it('should return null if no topics', async () => {
      axios.get.mockResolvedValue({ status: 404, data: null })
      wrapper = await shallowMount(Posts, { store })
      await wrapper.vm.$nextTick()

      expect(axios.get).toBeCalled()
      expect(wrapper.vm.posts).toHaveLength(0)
    })
  })

  describe('getCategory', () => {
    it('return an existing category', async () => {
      const data = {
        category_list: {
          categories: [
            {
              id: 1,
              permission: 1,
              name: 'Datashare Documents for test-datashare',
              created_by_dataconnect: true,
              icij_projects_for_category: [
                {
                  permission_type: 1,
                  group_name: 'test-datashare'
                }
              ]
            }
          ]
        },
        post_stream: {
          posts: []
        }
      }
      axios.get.mockResolvedValue({ data })
      wrapper = await shallowMount(Posts, { store })
      const response = await wrapper.vm.getCategory()

      expect(axios.get).toBeCalled()
      expect(response).toEqual(data.category_list.categories[0])
    })

    it.todo('should return null if no existing category')
  })

  describe('createCategory', () => {
    it('should creates a category', async () => {
      const data = {
        id: 1,
        name: 'Datashare Documents for test-datashare',
        post_stream: {
          posts: []
        }
      }
      axios.post.mockResolvedValue({ data })
      wrapper = await shallowMount(Posts, { store })
      const response = await wrapper.vm.createCategory()

      expect(axios.post).toBeCalled()
      expect(response).toEqual(data)
    })
  })

  describe('setCategory', () => {
    it('should return the existing category', async () => {
      const data = {
        category_list: {
          categories: [
            {
              id: 1,
              permission: 1,
              name: 'Datashare Documents for test-datashare',
              created_by_dataconnect: true,
              icij_projects_for_category: [
                {
                  permission_type: 1,
                  group_name: 'test-datashare'
                }
              ]
            }
          ]
        },
        post_stream: {
          posts: []
        }
      }
      axios.get.mockResolvedValue({ data })
      wrapper = await shallowMount(Posts, { store })
      const response = await wrapper.vm.setCategory()

      expect(axios.get).toBeCalled()
      expect(response).toEqual(data.category_list.categories[0])
    })

    it('should create the category if it does not exist', async () => {
      const data = {
        id: 2,
        name: 'Datashare Documents for test-datashare',
        post_stream: {
          posts: []
        }
      }
      axios.get.mockResolvedValue({ data })
      axios.post.mockResolvedValue({ data })
      wrapper = await shallowMount(Posts, { store })
      const mockMethod = jest.fn().mockReturnValue(null)
      wrapper.vm.getCategory = mockMethod
      const response = await wrapper.vm.setCategory()

      expect(mockMethod).toBeCalled()
      expect(axios.post).toBeCalled()
      expect(response).toEqual(data)
    })
  })

  describe('createComment', () => {
    it('should create a comment in the topic for the document', async () => {
      const data_topic = {
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


    })
  })
})
