import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import CommentsList from '../../../../components/CommentsList.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CommentsList.vue', () => {
  const comments = [
    {
      id: 1,
      username: 'testuser1',
      created_at: '23/12/2020',
      cooked: 'testing 1',
      full_url: 'https://testing.com/testing/1',
      avatar_template: '/avatar/{size}.png'
    },
    {
      id: 2,
      username: 'testuser2',
      created_at: '23/12/2020',
      cooked: 'testing 2',
      full_url: 'https://testing.com/testing/2',
      avatar_template: '/avatar/{size}.png'
    },
    {
      id: 3,
      username: 'testuser1',
      created_at: '23/12/2020',
      cooked: 'hello <a class="mention" href="/u/testuser2">@testuser2</a>',
      full_url: 'https://testing.com/testing/3',
      avatar_template: '/avatar/{size}.png'
    }
  ]

  const mocks = {
    $i18n: {
      locale: 'en'
    }
  }

  it('accesses comments through props', () => {
    const wrapper = shallowMount(CommentsList, { localVue, propsData: { comments }, mocks })
    expect(wrapper.props().comments).toBe(comments)
  })

  it('shows 3 comments', () => {
    const wrapper = shallowMount(CommentsList, { localVue, propsData: { comments }, mocks })
    expect(wrapper.find('.comments-list__comment ').exists()).toBeTruthy()
    expect(wrapper.findAll('.comments-list__comment ').length).toBe(comments.length)
  })

  it('shows 0 comments', () => {
    const wrapper = shallowMount(CommentsList, { localVue, propsData: { comments: [] }, mocks })
    expect(wrapper.find('.comments-list__comment ').exists()).toBeFalsy()
    expect(wrapper.findAll('.comments-list__comment ').length).toBe(0)
  })

  it('format the relative links to go to the orign', () => {
    const wrapper = shallowMount(CommentsList, { localVue, propsData: { comments }, mocks })
    const html = wrapper.findAll('.comments-list__comment__text').at(2).html()
    expect(html).toContain('hello <a class="mention" target="_blank" href="https://testing.com/u/testuser2">@testuser2</a>')
  })
})
