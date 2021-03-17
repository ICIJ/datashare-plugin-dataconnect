import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import CommentsList from '../../../../components/CommentsList.vue'

Vue.use(Vuex)

describe('CommentsList.vue', () => {
  it('accesses comments through props', () => {
    const comments = [{ id: 1, username: 'testuser1', created_at: '23/12/2020', cooked: 'testing 1', full_url: 'testing.com/testing/1'}, { id: 2, username: 'testuser2', created_at: '23/12/2020', cooked: 'testing 2', full_url: 'testing.com/testing/2'}]
    const wrapper = shallowMount(CommentsList, { propsData: { comments } })
    expect(wrapper.props().comments).toBe(comments)
  })

  it('shows 2 comments', () => {
    const comments = [{ id: 1, username: 'testuser1', created_at: '23/12/2020', cooked: 'testing 1', full_url: 'testing.com/testing/1'}, { id: 2, username: 'testuser2', created_at: '23/12/2020', cooked: 'testing 2', full_url: 'testing.com/testing/2'}]
    const wrapper = shallowMount(CommentsList, { propsData: { comments } })

    expect(wrapper.find('.row').exists()).toBeTruthy()
    expect(wrapper.findAll('.row').length).toBe(comments.length)
  })

  it('shows 0 comments', () => {
    const wrapper = shallowMount(CommentsList, { propsData: { comments: [] }})

    expect(wrapper.find('.row').exists()).toBeFalsy()
    expect(wrapper.findAll('.row').length).toBe(0)
  })
})
