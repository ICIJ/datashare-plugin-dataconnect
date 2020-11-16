import Posts from '../../../Posts.vue'
import { shallowMount } from '@vue/test-utils'
import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
jest.mock('axios')

describe('Posts.vue', () => {
  // Inspect the raw component options
  it('should perform a get request for a topic', () => {
    const state = { document: { idAndRouting: { id: 1 } }, search: { index: "test-datashare" } }
    const store = new Vuex.Store({state})
    const wrapper = shallowMount(Posts, {store})
    expect(axios.get).toBeCalled()
  })


})
