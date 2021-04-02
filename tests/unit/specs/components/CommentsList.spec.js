import Murmur from '@icij/murmur'
import { mount, createLocalVue } from '@vue/test-utils'
import { RecycleScroller } from 'vue-virtual-scroller'
import Vue from 'vue'
import Vuex from 'vuex'

import CommentsList from '../../../../components/CommentsList.vue'
import CommentPlaceholder from '../../../../components/CommentPlaceholder.vue'
import CommentRow from '../../../../components/CommentRow.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Murmur)

describe('CommentsList.vue', () => {
  const comments = [
    {
      id: 1,
      post_number: 1,
      username: 'testuser1',
      created_at: '2020-12-23',
      cooked: 'testing 1',
      full_url: 'https://testing.com/testing/1',
      avatar_template: '/avatar/{size}.png'
    },
    {
      id: 2,
      post_number: 2,
      username: 'testuser2',
      created_at: '2020-12-23',
      cooked: 'testing 2',
      full_url: 'https://testing.com/testing/2',
      avatar_template: '/avatar/{size}.png'
    },
    {
      id: 4,
      post_number: 4,
      placeholder: true,
      cooked: ''
    }
  ]

  it('accesses comments through props', () => {
    const wrapper = mount(CommentsList, { localVue, propsData: { comments } })
    expect(wrapper.props().comments).toBe(comments)
  })

  it('shows 2 comments', async () => {
    const wrapper = mount(CommentsList, { localVue, propsData: { comments } })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAllComponents(CommentRow).length).toBe(2)
  })

  it('shows 1 comment placeholder', async () => {
    const wrapper = mount(CommentsList, { localVue, propsData: { comments } })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAllComponents(CommentPlaceholder).length).toBe(1)
  })

  it('shows 0 comments', () => {
    const wrapper = mount(CommentsList, { localVue, propsData: { comments: [] } })
    expect(wrapper.findComponent(CommentRow).exists()).toBeFalsy()
    expect(wrapper.findAllComponents(CommentRow).length).toBe(0)
  })
})
