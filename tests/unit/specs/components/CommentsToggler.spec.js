import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { defineComponent } from 'vue'

import CorePlugin from '../../CorePlugin.js'

import CommentsToggler from '@/components/CommentsToggler.vue'

const sendAction = vi.fn()

vi.mock('@/composables/useApi', () => {
  return {
    useApi: () => ({ sendAction })
  }
})

describe('CommentsToggler.vue', () => {
  let wrapper

  const TestComponent = defineComponent({
    components: {
      CommentsToggler
    },
    template: `
      <suspense>
        <comments-toggler />
      </suspense>
    `
  })

  describe('with no comments', () => {
    beforeEach(async () => {
      sendAction.mockResolvedValue({ posts_count: 0 })
      const { plugins, stubs } = CorePlugin.init()
      const testWrapper = mount(TestComponent, { global: { plugins, stubs } })
      await flushPromises()
      wrapper = testWrapper.findComponent(CommentsToggler)
    })

    it('have a label', () => {
      expect(wrapper.attributes('label')).toBe('commentsToggler.label')
    })

    it('have a 0 comments', () => {
      expect(wrapper.vm.count).toBe(0)
    })
  })

  describe('with 10 comments', () => {
    beforeEach(async () => {
      const { plugins, stubs } = CorePlugin.init()
      sendAction.mockResolvedValue({ posts_count: 10 })
      const testWrapper = mount(TestComponent, { global: { plugins, stubs } })
      await flushPromises()
      wrapper = testWrapper.findComponent(CommentsToggler)
    })

    it('have a label', () => {
      expect(wrapper.attributes('label')).toBe('commentsToggler.label')
    })

    it('have a 10 comments', () => {
      expect(wrapper.vm.count).toBe(10)
    })
  })
})
