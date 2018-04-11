import {
  GET_USER,
} from '../mutations'

const getUserData = (key) => {
  const data = localStorage.getItem('starsManager-user') || null
  if (data) {
    return JSON.parse(data)[key]
  }
  return null
}

export default {
  state: {
    user: {
      id: getUserData('id'),
      name: getUserData('name'),
      avatar: getUserData('avatar'),
      repos: getUserData('repos') || 0,
      followers: getUserData('followers') || 0,
      following: getUserData('following') || 0
    }
  },
  mutations: {
    [GET_USER](state, data) {
      state.user.id = data.login
      state.user.name = data.name
      state.user.avatar = data.avatar_url
      state.user.repos = data.repos
      state.user.followers = data.followers
      state.user.following = data.following
    }
  }
}