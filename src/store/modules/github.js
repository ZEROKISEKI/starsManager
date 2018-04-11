import {
  GET_USER_STARRED,
  GET_STARRED_REPO_FILE,
  GET_STARRED_REPO_README,
} from '../mutations'

export default {
  state: {
    starredRepos: [],
    file: {},
    readme: {},
  },
  mutations: {
    [GET_USER_STARRED](state, data) {
      state.starredRepos = data
    },
    [GET_STARRED_REPO_FILE](state, data) {
      state.file = data
    },
    [GET_STARRED_REPO_README](state, data) {
      state.readme = data
    },
  }
}