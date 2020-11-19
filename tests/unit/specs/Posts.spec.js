import Posts from '../../../Posts.vue'
import { shallowMount } from '@vue/test-utils'
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

  describe('When Posts loads the posts from the Discourse API on mounted', () => {

    describe('When Posts successfully performs a get request for a topic to retrieve posts', () => {

      beforeAll(() => {
        statusCode = 200
        axios.get.mockResolvedValue({ status: statusCode, data: dataObject })
      })

      afterAll(() => jest.unmock('axios'))

      it('performs a get request', () => {
        wrapper = shallowMount(Posts, {store})
        expect(axios.get).toBeCalled()
      })

      it('returns data object containing posts from the Discourse API', async () => {
        wrapper = await shallowMount(Posts, {store})
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.topicResponse).toEqual({ status: statusCode, data: dataObject })
      })

      it('sets the posts based on the data object', async () => {
        wrapper = await shallowMount(Posts, {store})
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.posts).toEqual(dataObject.post_stream.posts)
      })

    })

    describe('When Posts unsuccessfully performs a get request and returns a 404 status code', () => {

      beforeAll(() => {
        statusCode = 404
        axios.get.mockResolvedValue({ status: statusCode, data: {} })
      })

      afterAll(() => jest.unmock('axios'))

      it('performs a get request', () => {
        wrapper = shallowMount(Posts, {store})
        expect(axios.get).toBeCalled()
      })

      it('does not receive a topicResponse', async () => {
        wrapper = await shallowMount(Posts, {store})
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.topicResponse).toBeNull()
      })

      it('does not immediately set posts', async () => {
        wrapper = await shallowMount(Posts, {store})
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.posts).toHaveLength(0)
      })
    })

  })

  describe('When Posts creates a comment', () => {
    describe('Get category from the Discourse API', () => {
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
        }
      }

      beforeAll(() => {
        statusCode = 200
        axios.get.mockResolvedValue({ status: statusCode, data: categoriesData })
      })

      afterAll(() => jest.unmock('axios'))

      it('performs a get request', () => {
        wrapper = shallowMount(Posts, {store})
        expect(axios.get).toBeCalled()
      })

      it('finds an existing category for the relevant project', async () => {
        wrapper = await shallowMount(Posts, {store})
        let response = await wrapper.vm.getCategory()

        expect(response).toEqual(categoriesData.category_list.categories[0])
      })
    })

    describe('Uses Discourse API to create a category', () => {
      const returnData = {
        id: 1,
        name: 'Datashare Documents for test-datashare'
      }

      beforeAll(() => {
        statusCode = 200
        axios.post.mockResolvedValue({ status: statusCode, data: returnData })
      })

      afterAll(() => jest.unmock('axios'))

      it('performs a post request', () => {
        wrapper = shallowMount(Posts, {store})
        wrapper.vm.createCategory()

        expect(axios.post).toBeCalled()
      })

      it('Creates a category', async () => {
        wrapper = await shallowMount(Posts, {store})
        const currentDsProject = wrapper.vm.$store.state.search.index

        let permissions = {}
        permissions[currentDsProject] = "1"
        let data = {
          name: `Datashare Documents for ${currentDsProject}`,
          color: "BF1E2E",
          text_color: "FFFFFF",
          permissions: permissions
        }

        let response = await wrapper.vm.createCategory()

        expect(response).toEqual(returnData)

      })
    })
  })
})
