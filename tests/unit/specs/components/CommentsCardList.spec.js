import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import CorePlugin from '../../CorePlugin.js'

import CommentsCardList from '@/components/CommentsCardList.vue'
import CommentsCardListComment from '@/components/CommentsCardListComment.vue'
import CommentsCardListPlaceholder from '@/components/CommentsCardListPlaceholder.vue'

describe('CommentsCardList.vue', () => {
  let wrapper

  const virtualComments = [
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

  const TestComponent = defineComponent({
    components: {
      CommentsCardList
    },
    props: {
      virtualComments: Array
    },
    template: `
      <suspense>
        <comments-card-list :virtual-comments="virtualComments" />
      </suspense>
    `
  })

  describe('with 3 comments', () => {
    beforeEach(async () => {
      const { plugins, stubs } = CorePlugin.init()
      wrapper = mount(TestComponent, { props: { virtualComments }, global: { plugins, stubs } })
      await flushPromises()
    })

    it('accesses comments through props', () => {
      expect(wrapper.props().virtualComments).toStrictEqual(virtualComments)
    })

    it('shows 2 comments', async () => {
      expect(wrapper.findAllComponents(CommentsCardListComment).length).toBe(2)
    })

    it('shows 1 comment placeholder', async () => {
      expect(wrapper.findAllComponents(CommentsCardListPlaceholder).length).toBe(1)
    })
  })

  describe('with no comments', () => {
    beforeEach(async () => {
      const { plugins, stubs } = CorePlugin.init()
      wrapper = mount(TestComponent, { props: { virtualComments: [] }, global: { plugins, stubs } })
      await flushPromises()
    })

    it('shows 0 comments', async () => {
      await wrapper.setProps({ virtualComments: [] })
      expect(wrapper.findComponent(CommentsCardListComment).exists()).toBeFalsy()
      expect(wrapper.findAllComponents(CommentsCardListComment).length).toBe(0)
    })
  })
})
