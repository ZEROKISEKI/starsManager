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

// 修改所有链接元素的链接(针对非完整地址, 比如#, ./, ../这些), 添加前缀
Vue.directive('openlink', function (el, binding) {

  let links = el.querySelectorAll('a')
  let filePath = binding.value
  let ownerEnd = filePath.indexOf('/')
  let repoEnd = filePath.indexOf('/', ownerEnd + 1)
  let owner = filePath.slice(0, ownerEnd)
  let repo = repoEnd === -1 ? filePath.slice(ownerEnd + 1) : filePath.slice(ownerEnd + 1, repoEnd)

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
    const src = image.getAttribute('src')
    if (src.startsWith('../') || src.startsWith('./') || !/https?:\/\//.test(src)) {
      // 前缀为https://github.com/:owner/:repo/raw/master
      image.setAttribute('src', `https://github.com/${owner}/${repo}/raw/master/${src}`)
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

// TODO localStorage切换成PouchDB