import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import 'vuetify/dist/vuetify.min.css'

import en from './lang/en'
import zh from './lang/zh'

Vue.use(VueI18n)
Vue.use(Vuex)
Vue.use(Vuetify)

import VuexStore from './store'

const store = new Vuex.Store(VuexStore)

const messages = {
  en,
  zh
}
const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'en',
  messages
})

import App from './App.vue'
import router from './router'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js'

import 'github-markdown-css'

Vue.directive('highlightjs', function(el) {
  new Promise((resolve, reject) => {
    hljs.highlightBlock(el)
    resolve()
  })
})

import pouchDB from './utils/pouch'
import getImageURI from './utils/image'

// 修改所有链接元素的链接(针对非完整地址, 比如#, ./, ../这些), 添加前缀
Vue.directive('openlink', function (el, binding) {

  // store.state.common
  if (binding.value !== binding.oldValue) {
    let links = el.querySelectorAll('a')
    let filePath = binding.value
    let ownerEnd = filePath.indexOf('/')
    let repoEnd = filePath.indexOf('/', ownerEnd + 1)
    let owner = filePath.slice(0, ownerEnd)
    let repo = repoEnd === -1 ? filePath.slice(ownerEnd + 1) : filePath.slice(ownerEnd + 1, repoEnd)

    if (store.state.common.offline) {

      let images = el.querySelectorAll('img')
      for(let image of images) {
        let src = image.getAttribute('src')
        if (src.startsWith('../') || src.startsWith('./') || !/https?:\/\//.test(src)) {
          // 前缀为https://github.com/:owner/:repo/raw/master
          src = `https://github.com/${owner}/${repo}/raw/master/${src}`
        }
        pouchDB.db.getAttachment(src, src).then(blob => {
          const dataURI = URL.createObjectURL(blob)
          image.setAttribute('src', dataURI)
        }).catch(err => {
          if (err.name === 'not_found') {
            image.setAttribute('alt', i18n.locale === 'zh' ? i18n.message.zh.noImage : i18n.message.en.noImage)
          }
        })
      }

    } else {
      for (let link of links) {

        const href = link.getAttribute('href')
        if (href.startsWith('#')) {
          // 前缀为https://github.com/:owner/:repo/
          link.setAttribute('href', `https://github.com/${owner}/${repo}${href}`)
        } else if(href.startsWith('../') || href.startsWith('./')) {
          // 前缀为https://github.com/:owner/:repo/blob/master
          link.setAttribute('href', `https://github.com/${owner}/${repo}/blob/master/${href}`)
        }

        if (link.getAttribute('target') !== '_blank') {
          link.setAttribute('target', '_blank')
        }

      }

      let images = el.querySelectorAll('img')
      for (let image of images) {
        let src = image.getAttribute('src')
        if (src.startsWith('../') || src.startsWith('./') || !/https?:\/\//.test(src)) {
          // 前缀为https://github.com/:owner/:repo/raw/master
          src = `https://github.com/${owner}/${repo}/raw/master/${src}`
          image.setAttribute('src', src)
        }
        getImageURI(src).then(dataURI => {
          pouchDB.db.get(src).then(doc => {
            return pouchDB.db.put(doc)
          }).catch(err => {
            if (err.name === 'not_found') {
              const doc = {
                _id: src,
                _attachments: {
                  [src]: {
                    content_type: 'image/*',
                    data: dataURI.replace('data:image/png;base64,', '')
                  }
                }
              }
              return pouchDB.db.put(doc)
            }
          })
        })
      }
    }
  }

})

new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
  i18n,
})

document.addEventListener('astilectron-ready', function() {
  astilectron.onMessage(message => {
    if (message.name === 'NoNetwork') {
      store.dispatch('setOffline')
    } else if (message.name === 'HasNetwork') {
      store.dispatch('setOnline')
    }
  })
})
