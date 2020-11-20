import { shallowMount, mount } from '@vue/test-utils'
import Posts from '../../../Posts.vue'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
jest.mock('axios')

describe('Posts.vue', () => {
  const state = { document: { idAndRouting: { id: 1 } }, search: { index: "test-datashare" } }
  const store = new Vuex.Store({state})
  let wrapper
  let statusCode

  const posts = [
    {
      id: 1,
      username: "testuser",
      created_at: "2020-10-16T15:21:29.039Z",
      cooked: "<p>trying to see if it creates a topic</p>"
    },
    {
      id: 2,
      username: "testuser2",
      created_at: "2020-10-16T17:00:29.039Z",
      cooked: "<p>trying to see if it creates a second topic</p>"
    }
  ]

  const dataObject = {
    post_stream: {
      posts: posts
    }
  }

  afterAll(() => jest.unmock('axios'))

  describe('When Posts loads the posts from the Discourse API on mounted', () => {

    describe('When Posts successfully performs a get request for a topic to retrieve posts', () => {

      beforeEach(() => {
        statusCode = 200
        axios.get.mockResolvedValue({ status: statusCode, data: dataObject })
      })

      it('sets the posts based on the data object', async () => {
        wrapper = await shallowMount(Posts, {store})
        await wrapper.vm.$nextTick()

        expect(axios.get).toBeCalled()
        expect(wrapper.vm.topicResponse).toEqual({ status: statusCode, data: dataObject })
        expect(wrapper.vm.posts).toEqual(dataObject.post_stream.posts)
      })

    })

    describe('When Posts unsuccessfully performs a get request and returns a 404 status code', () => {

      beforeEach(() => {
        statusCode = 404
        axios.get.mockResolvedValue({ status: statusCode, data: null })
      })

      afterEach(() => jest.unmock('axios'))

      it('does not immediately set posts', async () => {
        wrapper = await shallowMount(Posts, {store})
        await wrapper.vm.$nextTick()

        expect(axios.get).toBeCalled()
        expect(wrapper.vm.topicResponse).toBeNull()
        expect(wrapper.vm.posts).toHaveLength(0)
      })
    })

  })

  describe('When Posts creates a comment', () => {
    describe('getCategory() - Get category from the Discourse API', () => {
      const categoriesData = {
        category_list: {
          categories: [
            {
              id: 1,
              permission: 1,
              name: "Datashare Documents for test-datashare",
              created_by_dataconnect: true,
              icij_projects_for_category: [
                {
                  permission_type: 1,
                  group_name: "test-datashare"
                }
              ]
            }
          ]
        },
        post_stream: {
          posts: []
        }
      }

      beforeEach(() => {
        axios.get.mockResolvedValue({ data: categoriesData })
      })

      it('finds an existing category for the relevant project', async () => {
        wrapper = await shallowMount(Posts, {store})
        let response = await wrapper.vm.getCategory()

        expect(axios.get).toBeCalled()
        expect(response).toEqual(categoriesData.category_list.categories[0])
      })
    })

    describe('createCategory() - Uses Discourse API to create a category', () => {
      const returnData = {
        id: 1,
        name: 'Datashare Documents for test-datashare',
        post_stream: {
          posts: []
        }
      }

      beforeEach(() => {
        axios.post.mockResolvedValueOnce({ data: returnData })
      })

      it('Creates a category', async () => {
        wrapper = await shallowMount(Posts, {store})

        let response = await wrapper.vm.createCategory()

        expect(axios.post).toBeCalled()
        expect(response).toEqual(returnData)
      })
    })

    describe('setCategory() - Only creates a category if it does not exist already', () => {
      describe('Category exists', () => {
        const categoriesData = {
          category_list: {
            categories: [
              {
                id: 1,
                permission: 1,
                name: "Datashare Documents for test-datashare",
                created_by_dataconnect: true,
                icij_projects_for_category: [
                  {
                    permission_type: 1,
                    group_name: "test-datashare"
                  }
                ]
              }
            ]
          },
          post_stream: {
            posts: []
          }
        }

        beforeEach(() => {
          axios.get.mockResolvedValueOnce({ data: categoriesData })
        })

        afterEach(() => jest.unmock('axios'))

        it('Returns the category from the Discourse API', async () => {
          wrapper = await shallowMount(Posts, {store})
          let response = await wrapper.vm.setCategory()

          expect(axios.get).toBeCalled()
          expect(response).toEqual(categoriesData.category_list.categories[0])
        })
      })

      describe('Category does not exist', () => {
        const returnData = {
          id: 2,
          name: 'Datashare Documents for test-datashare',
          post_stream: {
            posts: []
          }
        }

        beforeAll(() => {
          axios.get.mockResolvedValue({ data: returnData })
          axios.post.mockResolvedValue({ data: returnData })
        })

        it('creates the category', async () => {
          wrapper = await shallowMount(Posts, {store})
          const mockMethod = jest.fn().mockReturnValue(null)
          wrapper.vm.getCategory = mockMethod
          let response = await wrapper.vm.setCategory()

          expect(mockMethod).toBeCalled()
          expect(axios.post).toBeCalled()
          expect(response).toEqual(returnData)
        })
      })
    })
  })
})
