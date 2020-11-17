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
  const wrapper = shallowMount(Posts, {store})

  // afterEach(() => {
  //   axios.request.mockClear()
  // })

  it('performs a get request for a topic in order to set the posts', () => {
    expect(axios.get).toBeCalled()
  })

  // console.log(wrapper.vm._data.posts)
  it('successfully returns a data object from the Discourse API', async () => {
    const data = {
      data: {
        post_stream: {
          posts: [
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
        }
      }
    }

    axios.get.mockImplementationOnce(() => Promise.resolve(data))

    // await expect(received).resolves.toEqual(data)
  })

  it('erroneously returns a data object from the Discourse API', () => {

  })


})
