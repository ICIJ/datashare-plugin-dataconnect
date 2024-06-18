import { flushPromises, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import CorePlugin from '../../CorePlugin.js'
import CommentsTabLabel from '@components/CommentsTabLabel.vue'

vi.mock('axios')

describe('CommentsTabLabel.vue', () => {
  let wrapper
  
  describe('with no comments', () => {

    beforeEach(async () => {
      const { plugins, stubs } = CorePlugin.init()
      const data = { "posts_count": 0 }
      axios.request.mockResolvedValue({ data })    
      wrapper = shallowMount(CommentsTabLabel, { global: { plugins, stubs } })
      await flushPromises()
    })

    afterEach(() => {
      axios.request.mockReset()
    })

    it('shows the "Comments" label', () => {    
      expect(wrapper.find('.comments-tab-label__label').text()).toBe("Comments")
    })

    it('doesnt show 0 comments in a badge', () => {
      expect(wrapper.find('.comments-tab-label__count').exists()).toBeFalsy()
    })
  })

  describe('with no comments', () => {

    beforeEach(async () => {
      const { plugins, stubs } = CorePlugin.init()
      const data = { "posts_count": 10 }
      axios.request.mockResolvedValue({ data })
      wrapper = shallowMount(CommentsTabLabel, { global: { plugins, stubs } })
      await flushPromises()
    })

    afterEach(() => {
      axios.request.mockReset()
    })

    it('show 10 comments in a badge', () => { 
      expect(wrapper.find('.comments-tab-label__count').text()).toBe("10")
    })
  })
})
