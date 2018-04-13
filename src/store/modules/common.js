import {
  LOADING,
  LOADING_COMPLETE,
  FILE_LOADING,
  FILE_LOADING_COMPLETE,
  TREE_LOADING,
  TREE_LOADING_COMPLETE,
} from "../mutations";

export default {
  state: {
    loading: true,
    fileLoading: true,
    treeLoading: true,
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
    [TREE_LOADING](state) {
      state.treeLoading = true
    },
    [TREE_LOADING_COMPLETE](state) {
      state.treeLoading = false
    }
  }
}