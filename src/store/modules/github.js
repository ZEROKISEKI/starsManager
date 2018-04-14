import {
  GET_USER_STARRED,
  GET_STARRED_REPO_FILE,
  GET_STARRED_REPO_README,
  SET_FILE_PATH,
  GET_STARRED_REPO_TREE,
} from '../mutations'
import pouchDB from '../../utils/pouch'

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
      if(Array.isArray(data)) {
        state.starredRepos = data
        pouchDB.db.get('starredRepos').then(function (doc) {
          doc.starredRepos = state.starredRepos
          return pouchDB.db.put(doc)
        }).catch(err => {
          if (err.name === 'not_found') {
            const doc = {
              _id: 'starredRepos',
              starredRepos: state.starredRepos
            }
            return pouchDB.db.put(doc)
          }
        })
      } else {
        state.starredRepos = data.starredRepos
      }
    },
    [GET_STARRED_REPO_FILE](state, { file, owner, repo }) {
      if(file._id) {
        state.file = file.data
        state.owner = owner
        state.repo = repo
      } else {
        state.file = file
        state.owner = owner
        state.repo = repo
        pouchDB.db.get(`${owner}/${repo}/${file.path}`).then(doc => {
          doc.data = state.file
          return pouchDB.db.put(doc)
        }).catch(err => {
          if (err.name === 'not_found') {
            const doc = {
              _id: `${owner}/${repo}/${file.path}`,
              data: state.file
            }
            return pouchDB.db.put(doc)
          }
        })
      }
    },
    [GET_STARRED_REPO_README](state, { readme, owner, repo }) {
      if(readme._id) {
        state.readme = readme.data
        state.owner = owner
        state.repo = repo
      } else {
        state.readme = readme
        state.owner = owner
        state.repo = repo
        pouchDB.db.get(`${owner}/${repo}/README.md`).then(doc => {
          doc.data = state.readme
          return pouchDB.db.put(doc)
        }).catch(err => {
          if (err.name === 'not_found') {
            const doc = {
              _id: `${owner}/${repo}/README.md`,
              data: state.readme
            }
            return pouchDB.db.put(doc)
          }
        })
      }
    },
    [SET_FILE_PATH](state, path) {
      state.filePath = path
    },
    [GET_STARRED_REPO_TREE](state, { owner, repo, data }) {
      if(data._id) {
        state.starredReposTree.push({
          owner,
          repo,
          data: data.data
        })
      } else {
        state.starredReposTree.push({
          owner,
          repo,
          data
        })
        pouchDB.db.get(`tree:${owner}/${repo}`).then(doc => {
          doc.data = data
          return pouchDB.db.put(doc)
        }).catch(err => {
          if (err.name === 'not_found') {
            const doc = {
              _id: `tree:${owner}/${repo}`,
              data: data
            }
            return pouchDB.db.put(doc)
          }
        })
      }
    }
  }
}