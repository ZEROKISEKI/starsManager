import {
  SET_ACCESS_TOKEN,
  REMOVE_ACCESS_TOKEN,
} from '../mutations'

export default {
  state: {
    access_token: localStorage.getItem('starsManager-access-token') || null,
  },
  mutations: {
    [SET_ACCESS_TOKEN](state, token) {
      state.access_token = token
      // 保存token
      localStorage.setItem('starsManager-access-token', token)
    },
    [REMOVE_ACCESS_TOKEN](state) {
      state.access_token = null
      localStorage.removeItem('starsManager-access-token')
    }
  }
}