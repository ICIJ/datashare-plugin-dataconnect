import { shallowMount } from '@vue/test-utils'
import axios from 'axios'

import CorePlugin from '../../CorePlugin.js'
import Comments from '@components/Comments.vue'

vi.mock('axios')

describe('Comments.vue', () => {
  let wrapper
  
  beforeEach(async () => {
    const { plugins, stubs } = CorePlugin.init()
    Comments.methods.getCount = () => 2
    wrapper = await shallowMount(Comments, { global: { plugins, stubs } })
  })

  afterEach(() => {
    axios.request.mockReset()
  })

  it('should return empty array if an error occurs', async () => {
    try {
      axios.request.mockRejectedValue()
    } catch (_) {  }
    expect(wrapper.vm.comments).toHaveLength(0)
    expect(wrapper.vm.comments).toEqual([])
  })

  it('should return empty array if no topics', async () => {
    axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [] } } } })
    
    expect(wrapper.vm.comments).toHaveLength(0)
    expect(wrapper.vm.comments).toEqual([])
  })
  
  it('should retrieve topics if any', async () => {
    axios.request.mockResolvedValue({ data: { topic_view_posts: { post_stream: { posts: [{ id: 1 }, { id: 2 }] } } } })
    await wrapper.vm.getComments()
      
    expect(wrapper.vm.comments).toHaveLength(2)
    expect(wrapper.vm.comments).toEqual([{ id: 1 }, { id: 2 }])
  })
})
