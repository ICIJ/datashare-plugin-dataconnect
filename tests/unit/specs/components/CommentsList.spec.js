import { mount } from '@vue/test-utils'

import CorePlugin from '../../CorePlugin.js'
import CommentsList from '@components/CommentsList.vue'
import CommentPlaceholder from '@components/CommentPlaceholder.vue'
import CommentRow from '@components/CommentRow.vue'

describe('CommentsList.vue', () => {
  let wrapper

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

  describe('with 3 comments', () => {
    beforeEach(() => {
      const { plugins, stubs } = CorePlugin.init()
      wrapper = mount(CommentsList, { props: { comments }, global: { plugins, stubs } })
    })

    it('accesses comments through props', () => {
      expect(wrapper.props().comments).toStrictEqual(comments)
    })

    it('shows 2 comments', async () => {      
      expect(wrapper.findAllComponents(CommentRow).length).toBe(2)
    })

    it('shows 1 comment placeholder', async () => {      
      expect(wrapper.findAllComponents(CommentPlaceholder).length).toBe(1)
    })
  })

  describe('with no comments', () => {
    beforeEach(() => {
      const { plugins, stubs } = CorePlugin.init()
      wrapper = mount(CommentsList, { props: { comments: [] }, global: { plugins, stubs } })
    })
  
    it('shows 0 comments', async () => {
      await wrapper.setProps({ comments: [] })
      console.log(wrapper.html())
      expect(wrapper.findComponent(CommentRow).exists()).toBeFalsy()
      expect(wrapper.findAllComponents(CommentRow).length).toBe(0)
    })
  })
})
