import { mount } from '@vue/test-utils'
import CorePlugin from '../../CorePlugin.js'
import CommentRow from '@components/CommentRow.vue'

describe('CommentRow.vue', () => {
  let plugins, wrapper
  
  const comment = {
    id: 3,
    post_number: 3,
    username: 'testuser1',
    created_at: '2020-12-23T00:00:00',
    cooked: 'hello <a class="mention" href="/u/testuser2">@testuser2</a>',
    full_url: 'https://testing.com/testing/3',
    avatar_template: '/avatar/{size}.png'
  }

  beforeEach(() => {
    plugins = [CorePlugin.init()]
    wrapper = mount(CommentRow, { props: { comment }, global: { plugins } })
  })

  it('format the relative links to go to the orign', () => {
    const html = wrapper.find('.comment-row__text').html()
    expect(html).toContain('hello <a class="mention" target="_blank" href="https://testing.com/u/testuser2">@testuser2</a>')
  })

  it('extract the user avatar from the comment properties', () => {    
    const avatar = wrapper.find('.comment-row__avatar img')
    expect(avatar.attributes('src')).toBe('https://testing.com/avatar/45.png')
  })

  it('extract the author link from the comment properties', () => {    
    const author = wrapper.find('.comment-row__header__author')
    expect(author.attributes('href')).toBe('https://testing.com/u/testuser1/')
  })

  it('shorten the date', () => {    
    const date = wrapper.find('.comment-row__header__date')
    expect(date.text()).toBe('Dec 23, 20, 12:00 AM')
  })
})
