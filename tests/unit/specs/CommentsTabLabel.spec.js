import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

import CommentsTabLabel from '../../../CommentsTabLabel.vue'

Vue.use(Vuex)
jest.mock('axios')

describe('CommentsTabLabel.vue', () => {
  const state = { document: { doc: { slicedName: 'test.pdf', id: '1' } }, search: { index: 'test-datashare' } }
  const store = new Vuex.Store({ state })
  const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

  beforeEach(async () => {
    axios.request.mockClear()
  })

  afterAll(() => jest.unmock('axios'))

  it('shows the "Comments" label', () => {
    const wrapper = shallowMount(CommentsTabLabel, { store })
    expect(wrapper.find('.comments-tab-label__label').text()).toBe("Comments")
  })

  it('show 0 comments in a badge', async () => {
    const data = { "posts_count": 0 }
    axios.request.mockResolvedValue({ data })
    const wrapper = shallowMount(CommentsTabLabel, { store })
    await flushPromises()
    expect(wrapper.find('.comments-tab-label__count').text()).toBe("0")
  })

  it('show 10 comments in a badge', async () => {
    const data = { "posts_count": 10 }
    axios.request.mockResolvedValue({ data })
    const wrapper = shallowMount(CommentsTabLabel, { store })
    await flushPromises()
    expect(wrapper.find('.comments-tab-label__count').text()).toBe("10")
  })
})
