import {
  GET_USER,
} from '../mutations'
import pouchDB from '../../utils/pouch'
import getImageURI from '../../utils/image'

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
      if (!data._id) {
        getImageURI(state.user.avatar).then(avatar_url => {
          pouchDB.db.get('user').then(doc => {
            const rev = doc._rev
            const t = Object.assign({ _id: 'user' }, state.user)
            t.login = t.id
            t.avatar_url = avatar_url
            delete t.id
            delete t.avatar
            doc = t
            doc._rev = rev
            return pouchDB.db.put(doc)
          }).catch(err => {
            if (err.name === 'not_found') {
              const doc = Object.assign({ _id: 'user' }, state.user)
              doc.login = doc.id
              doc.avatar_url = avatar_url
              delete doc.id
              delete doc.avatar
              return pouchDB.db.put(doc)
            }
          })
        })
      }
    }
  }
}