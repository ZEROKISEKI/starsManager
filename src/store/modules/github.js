import {
  GET_USER_STARRED,
  GET_STARRED_REPO_FILE,
  GET_STARRED_REPO_README,
  SET_FILE_PATH,
  GET_STARRED_REPO_TREE,
} from '../mutations'

export default {
  state: {
    starredRepos: [],
    file: {},
    readme: {},
    owner: null,
    repo: null,
    starredReposTree: [],
    filePath: null,
  },
  mutations: {
    [GET_USER_STARRED](state, data) {
      state.starredRepos = data
    },
    [GET_STARRED_REPO_FILE](state, { file, owner, repo }) {
      state.file = file
      state.owner = owner
      state.repo = repo
    },
    [GET_STARRED_REPO_README](state, { readme, owner, repo }) {
      state.readme = readme
      state.owner = owner
      state.repo = repo
    },
    [SET_FILE_PATH](state, path) {
      state.filePath = path
    },
    [GET_STARRED_REPO_TREE](state, data) {
      state.starredReposTree.push(data)
    }
  }
}