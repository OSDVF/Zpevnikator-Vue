import Vue from 'vue'
import VueRouter from 'vue-router'
import List from './views/List.vue'
import Song from './views/Song.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "pages" */ './views/Home.vue')
  },
  {
    path: '/seznam',
    name: 'list',
    component: List
  },
  {
    path: '/song',
    name: 'song',
    component: Song
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "pages" */ './views/About.vue')
  },
  {
    path: '/offline',
    name: 'offline',
    component: () => import(/* webpackChunkName: "pages" */ './views/AppManage.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "pages" */ './views/Profile.vue')
  },
  {
    path: '*',
    component: () => import(/* webpackChunkName: "pages" */ './views/NotFound.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,

})

export default router
