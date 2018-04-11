import auth from './modules/auth'
import user from './modules/user'
import github from './modules/github'
import common from './modules/common'
import actions from './actions'

export default {
  modules: {
    common,
    auth,
    user,
    github,
  },
  actions,
}