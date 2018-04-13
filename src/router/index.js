import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login.vue'
import Main from '../components/Main.vue'
import Origin from '../components/Origin.vue'
import Custom from '../components/Custom.vue'

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/main',
      name: 'Main',
      component: Main,
      children: [{
        // 按language来分, 没有为all
        path: 'origin/:language?',
        name: 'Origin',
        component: Origin,
      }, {
        // name为自定义的分类名称
        path: 'custom/:name',
        name: 'Custom',
        component: Custom,
      }]
    }
  ]
})

// 添加oauth认证检查
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('starsManager-access-token') || null
  if (token && (to.name === 'Login' || to.name === null)) {
    next({
      path: '/main',
      name: 'Main'
    })
  } else if (!token && to.name !== 'Login') {
    next({
      path: '/login',
      name: 'Login',
      query: {
        redirect: to.fullPath
      }
    })
  } else {
    next()
  }
})

export default router