import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import CorePlugin from '../../CorePlugin.js'

import CommentsCardListComment from '@/components/CommentsCardListComment.vue'

describe('CommentsCardListComment.vue', () => {
  let wrapper

  const comment = {
    id: 3,
    post_number: 3,
    username: 'testuser1',
    created_at: '2020-12-23T00:00:00',
    cooked: 'hello <a class="mention" href="/u/testuser2">@testuser2</a>',
    full_url: 'https://testing.com/testing/3',
    avatar_template: '/avatar/{size}.png'
  }

  const TestComponent = defineComponent({
    components: {
      CommentsCardListComment
    },
    props: {
      comment: Object
    },
    template: `
      <suspense>
        <comments-card-list-comment :comment="comment" />
      </suspense>
    `
  })

  beforeEach(async () => {
    const { plugins } = CorePlugin.init()
    wrapper = mount(TestComponent, { props: { comment }, global: { plugins } })
    await flushPromises()
  })

  it('format the relative links to go to the orign', () => {
    const html = wrapper.html()
    expect(html).toContain(
      'hello <a class="mention" target="_blank" href="https://testing.com/u/testuser2">@testuser2</a>'
    )
  })
})
