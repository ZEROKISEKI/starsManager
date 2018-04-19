import request from '../utils/request'
import * as type from './mutations'
import { base64ToUtf8 } from '../utils/escape'
import { imageType } from '../utils/filter'
import formatTree from '../utils/format'
import pouchDB from '../utils/pouch'

export default {

  setOnline({ commit }) {
    commit(type.ONLINE)
  },

  setOffline({ commit }) {
    commit(type.OFFLINE)
  },

  loadingStill({ commit }) {
    commit(type.LOADING)
  },

  loadingComplete({ commit }) {
    commit(type.LOADING_COMPLETE)
  },

  fileLoadingStill({ commit }) {
    commit(type.FILE_LOADING)
  },

  fileLoadingComplete({ commit }) {
    commit(type.FILE_LOADING_COMPLETE)
  },

  setFileStatus({ commit }, status) {
    commit(type.FILE_STATUS, status)
  },

  treeLoadingStill({ commit }) {
    commit(type.TREE_LOADING)
  },

  treeLoadingComplete({ commit }) {
    commit(type.TREE_LOADING_COMPLETE)
  },

  setTreeStatus({ commit }, status) {
    commit(type.TREE_STATUS, status)
  },

  settingsLoadingStill({ commit }) {
    commit(type.SETTINGS_LOADING)
  },

  settingsLoadingComplete({ commit }) {
    commit(type.SETTINGS_LOADING_COMPLETE)
  },

  setAccessToken({ commit }, token) {
    commit(type.SET_ACCESS_TOKEN, token)
  },
  removeAccessToken({ commit }) {
    commit(type.REMOVE_ACCESS_TOKEN)
  },

  getUser({ commit, state: { common } }) {

    // 这种是在线 -> 离线的情况
    if (common.offline) {
      pouchDB.db.get('user').then(function (doc) {
        commit(type.GET_USER, doc)
      })
    } else {
      return request({
        url: '/user'
      }).then(res => {
        commit(type.GET_USER, res.data)
      }, err => {
        if(!err.status) {
          pouchDB.db.get('user').then(function (doc) {
            commit(type.GET_USER, doc)
          })
          throw(err)
        } else {
          return err
        }
      })
    }
  },

  getUserStarredRepos({ commit, state: { common } }) {

    if (common.offline) {
      pouchDB.db.get('starredRepos').then(function (doc) {
        commit(type.GET_USER_STARRED, doc)
      })
    } else {
      return request({
        url: '/user/starred',
        params: {
          per_page: 100,
        }
      }).then(res => {
        const { link } = res.headers
        const lastPageUrl = link.slice(link.indexOf('rel="next", <') + 13, link.indexOf('>; rel="last"'))
        const parameters = lastPageUrl.substr(lastPageUrl.indexOf('?') + 1).split('&').map(e => {
          const [key, value] = e.split('=')
          return {
            key,
            value
          }
        })

        let page
        for(let param of parameters) {
          if(param.key === 'page') {
            page = param.value
            break
          }
        }
        const requests = []
        for(let i = 2; i <= page; i++) {
          requests.push(request({
            url: '/user/starred',
            params: {
              page: i,
              per_page: 100,
            }
          }))
        }

        return Promise.all(requests).then(resp => {
          for(let d of resp.map(e => e.data)) {
            res.data.push(...d)
          }
          commit(type.GET_USER_STARRED, res.data)
        }, err => err)

      }, err => {
        if(!err.status) {
          pouchDB.db.get('starredRepos').then(function (doc) {
            commit(type.GET_USER_STARRED, doc)
          })
          throw(err)
        } else {
          return err
        }
      })
    }
  },

  getStarredRepoFile({ commit, state: { common } }, { owner, repo, path }) {

    commit(type.FILE_STATUS, false)

    if (common.offline) {
      pouchDB.db.get(`${owner}/${repo}/${path}`).then(doc => {
        commit(type.GET_STARRED_REPO_FILE, {
          file: doc,
          owner,
          repo
        })
      }).catch(err => {
        if (err.name === 'not_found') {
          commit(type.FILE_STATUS, true)
          return err
        }
      })
    } else {
      return request({
        url: `/repos/${owner}/${repo}/contents/${path}`,
        headers: {
          Accept: 'application/vnd.github.VERSION.full+json'
        }
      }).then(res => {

        if (/\.md$/i.test(res.data.name)) {
          request({
            method: 'post',
            url: '/markdown/raw',
            headers: {
              'Content-Type': 'text/plain'
            },
            data: base64ToUtf8(res.data.content),
            baseConfig: {
              responseType: 'text'
            }
          }).then(resp => {
            res.data.content = resp.data
            commit(type.GET_STARRED_REPO_FILE, {
              file: res.data,
              owner,
              repo
            })
          }, err => {
            commit(type.FILE_STATUS, true)
            return err
          })
        } else {
          // 图片就不用解码了
          res.data.content = imageType.test(res.data.name) ? res.data.content : base64ToUtf8(res.data.content)
          commit(type.GET_STARRED_REPO_FILE, {
            file: res.data,
            owner,
            repo
          })
        }
      }, err => {
        if(!err.status) {
          pouchDB.db.get(`${owner}/${repo}/${path}`).then(doc => {
            commit(type.GET_STARRED_REPO_FILE, {
              file: doc,
              owner,
              repo
            })
          }).catch(err => {
            if (err.name === 'not_found') {
              commit(type.FILE_STATUS, true)
              return err
            }
          })
          throw(err)
        } else {
          commit(type.FILE_STATUS, true)
          return err
        }
      })
    }

  },

  // 原本想着只用一个接口就可以的, 但是README.md在上一个接口会出现问题, 参见axios issues#1471
  getStarredRepoReadme({ commit, state: { common } }, { owner, repo }) {

    commit(type.FILE_STATUS, false)

    if (common.offline) {
      pouchDB.db.get(`${owner}/${repo}/README.md`).then(doc => {
        commit(type.GET_STARRED_REPO_README, {
          readme: doc,
          owner,
          repo
        })
      }).catch(err => {
        if (err.name === 'not_found') {
          commit(type.FILE_STATUS, true)
          return err
        }
      })
    } else {
      return request({
        url: `/repos/${owner}/${repo}/readme`,
        headers: {
          Accept: 'application/vnd.github.VERSION.full+json'
        }
      }).then(res => {
        return request({
          method: 'post',
          url: '/markdown/raw',
          headers: {
            'Content-Type': 'text/plain'
          },
          data: base64ToUtf8(res.data.content),
          baseConfig: {
            responseType: 'text'
          }
        }).then(resp => {
          res.data.content = resp.data
          commit(type.GET_STARRED_REPO_README, {
            readme: res.data,
            owner,
            repo
          })
        }, err => {
          commit(type.FILE_STATUS, true)
          return err
        })
      }, err => {
        if(!err.status) {
          pouchDB.db.get(`${owner}/${repo}/README.md`).then(doc => {
            commit(type.GET_STARRED_REPO_README, {
              readme: doc,
              owner,
              repo
            })
          }).catch(err => {
            if (err.name === 'not_found') {
              commit(type.FILE_STATUS, true)
              return err
            }
          })
          throw(err)
        } else {
          commit(type.FILE_STATUS, true)
          return err
        }
      })
    }
  },

  // 涉及到递归组件传递, 所以就用状态管理
  setFilePath({ commit }, path) {
    commit(type.SET_FILE_PATH, path)
  },

  getStarredRepoTree({ commit, state: { common } }, { owner, repo }) {

    commit(type.TREE_STATUS, false)

    if (common.offline) {
      pouchDB.db.get(`tree:${owner}/${repo}`).then(doc => {
        console.log(doc)
        commit(type.GET_STARRED_REPO_TREE, {
          owner,
          repo,
          data: doc
        })
      }).catch(err => {
        if (err.name === 'not_found') {
          commit(type.TREE_STATUS, true)
          return err
        }
      })
    } else {
      return request({
        url: `/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      }).then(res => {
        formatTree(res.data.tree, owner, repo).then(data => {
          commit(type.GET_STARRED_REPO_TREE, {
            owner,
            repo,
            data
          })
        }, err => err)
      }, err => {
        if(!err.status) {
          pouchDB.db.get(`tree:${owner}/${repo}`).then(doc => {
            commit(type.GET_STARRED_REPO_TREE, {
              owner,
              repo,
              data: doc
            })
          }).catch(err => {
            if (err.name === 'not_found') {
              commit(type.TREE_STATUS, true)
              return err
            }
          })
          throw(err)
        } else {
          commit(type.TREE_STATUS, true)
          return err
        }
      })
    }
  },

  // 获取本地配置
  getSettings({ commit }, settings) {
    commit(type.GET_SETTINGS, settings || {
      storageRepo: {
        path: {}
      },
      cloneRepoPath: {}
    })
  },

  // 清除缓存
  clearDBCache({ commit }) {
    return pouchDB.clear().then(res => {
      return res
    }).catch(err => {
      throw(err)
    })
  },

  setStorageRepoName({ commit }, repoName) {
    return new Promise((resolve, reject) => {
      astilectron.sendMessage({ 'name': 'CreateStorageRepo', 'payload': repoName }, message => {
        if (message.name === 'CreateStorageRepo.callback') {
          if (message.payload === 'success') {
            commit(type.SET_STORAGE_REPO_NAME, repoName)
            resolve()
          } else {
            reject(message.payload)
          }
        }
      })
    })
  },

  addClassification({ commit, state: { github } }, classificationName) {
    return new Promise((resolve, reject) => {
      astilectron.sendMessage({ 'name': 'AddClassification', 'payload': {
          classificationName,
          storageRepoName: github.storageRepoName
        }
      }, message => {
        if (message.payload && message.payload.name) {
          commit(type.ADD_CLASSIFICATION, {
            name: message.payload.name,
            createdDate: message.payload.createdDate,
            repos: message.payload.repos || []
          })
          resolve()
        } else {
          reject(message.payload)
        }
      })
    })
  },

  getClassification({ commit, state: { github } }) {
    return new Promise((resolve, reject) => {
      if (github.storageRepoName) {
        astilectron.sendMessage({ 'name': 'GetClassification', 'payload': {
            storageRepoName: github.storageRepoName
          }
        }, message => {
          if (typeof message.payload !== 'string') {
            commit(type.GET_CLASSIFICATION, message.payload.map(e => {
              if(!e.repos) e.repos = []
              return e
            }))
            resolve()
          } else {
            reject(message.payload)
          }
        })
      } else {
        reject()
      }
    })
  },

  setClassification({ commit, state: { github } }, classification) {
    return new Promise((resolve, reject) => {
      astilectron.sendMessage({ 'name': 'SetClassification', 'payload': {
          storageRepoName: github.storageRepoName,
          classification
        }
      }, message => {
        if (message.payload === 'success') {
          commit(type.SET_CLASSIFICATION, classification)
          resolve()
        } else {
          reject(message.payload)
        }
      })
    })
  },

}