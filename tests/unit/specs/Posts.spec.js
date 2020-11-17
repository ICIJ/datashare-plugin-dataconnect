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

  const data = {
    data: {
      post_stream: {
        posts: posts
      }
    }
  }

  describe('When Posts successfully performs a get request for a topic to retrieve posts', () => {

    beforeAll(() => {
      axios.get.mockResolvedValue(data)
    })

    it('performs a get request', () => {
      wrapper = shallowMount(Posts, {store})
      expect(axios.get).toBeCalled()
    })

    it('returns data object containing posts from the Discourse API', async () => {
      wrapper = await shallowMount(Posts, {store})
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.topicResponse).toEqual(data)
    })

    it('sets the posts based on the data object', async () => {
      wrapper = await shallowMount(Posts, {store})
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.posts).toEqual(posts)
    })

  })

  it('erroneously returns a data object from the Discourse API', () => {

  })


})
