import request from '../utils/request'
import * as type from './mutations'
import { base64ToUtf8 } from '../utils/escape'
import { imageType } from '../utils/filter'
import formatTree from '../utils/formate'

export default {

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

  treeLoadingStill({ commit }) {
    commit(type.TREE_LOADING)
  },

  treeLoadingComplete({ commit }) {
    commit(type.TREE_LOADING_COMPLETE)
  },

  setAccessToken({ commit }, token) {
    commit(type.SET_ACCESS_TOKEN, token)
  },
  removeAccessToken({ commit }) {
    commit(type.REMOVE_ACCESS_TOKEN)
  },

  getUser({ commit }) {

    return request({
      url: '/user'
    }).then(res => {
      commit(type.GET_USER, res.data)
    }, err => err)
  },

  getUserStarredRepos({ commit }) {

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

    }, err => err)
  },

  getStarredRepoFile({ commit }, { owner, repo, path }) {

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
    }, err => err)
  },

  // 原本想着只用一个接口就可以的, 但是README.md在上一个接口会出现问题, 参见axios issues#1471
  getStarredRepoReadme({ commit }, { owner, repo }) {
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
      }, err => err)
    }, err => err)
  },

  // 涉及到递归组件传递, 所以就用状态管理
  setFilePath({ commit }, path) {
    commit(type.SET_FILE_PATH, path)
  },

  getStarredRepoTree({ commit }, { owner, repo }) {
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
    }, err => err)
  },

}