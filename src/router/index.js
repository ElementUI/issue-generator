import Vue from 'vue'
import Router from 'vue-router'
import Content from '@/components/content'

Vue.use(Router)

const lang = window.navigator.language

export default new Router({
  routes: [
    {
      path: '/en-US',
      name: 'en-US',
      component: Content
    },
    {
      path: '/zh-CN',
      name: 'zh-CN',
      component: Content
    },
    {
      path: '*',
      redirect: `/${lang}`
    }
  ]
})
