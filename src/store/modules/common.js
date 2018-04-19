import {
  LOADING,
  LOADING_COMPLETE,
  FILE_LOADING,
  FILE_LOADING_COMPLETE,
  FILE_STATUS,
  TREE_LOADING,
  TREE_LOADING_COMPLETE,
  TREE_STATUS,
  SETTINGS_LOADING,
  SETTINGS_LOADING_COMPLETE,
  GET_SETTINGS,
  ONLINE,
  OFFLINE,
} from "../mutations";
// import defaultSettings from '../../utils/defaultSettings'

export default {
  state: {
    offline: false,
    loading: true,
    fileLoading: true,
    fileFailed: false,
    treeLoading: true,
    treeFailed: false,
    settingsLoading: true,
    settings: {
      storageRepo: {
        path: {}
      },
      cloneRepoPath: {}
    }
  },
  mutations: {
    [LOADING](state) {
      state.loading = true
    },
    [LOADING_COMPLETE](state) {
      state.loading = false
    },
    [FILE_LOADING](state) {
      state.fileLoading = true
    },
    [FILE_LOADING_COMPLETE](state) {
      state.fileLoading = false
    },
    [FILE_STATUS](state, status) {
      state.fileFailed = status
    },
    [TREE_LOADING](state) {
      state.treeLoading = true
    },
    [TREE_LOADING_COMPLETE](state) {
      state.treeLoading = false
    },
    [TREE_STATUS](state, status) {
      state.treeFailed = status
    },
    [SETTINGS_LOADING](state) {
      state.settingsLoading = true
    },
    [SETTINGS_LOADING_COMPLETE](state) {
      state.settingsLoading = false
    },
    [GET_SETTINGS](state, settings) {
      state.settings = settings
    },
    [ONLINE](state) {
      state.offline = false
    },
    [OFFLINE](state) {
      state.offline = true
    }
  }
}