import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

import Comments from '../../../../components/Comments.vue'

Vue.use(Vuex)
jest.mock('axios')

describe('Comments.vue', () => {
  const state = { document: { doc: { slicedName: 'test.pdf' }, idAndRouting: { id: '1' } }, search: { index: 'test-datashare' } }
  const store = new Vuex.Store({ state })
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(Comments, { store })
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

})
