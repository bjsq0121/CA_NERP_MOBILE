import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/estimates' },
  { path: '/login', component: () => import('../views/Login.vue'), meta: { public: true } },

  // 판매견적
  { path: '/estimates', component: () => import('../views/EstimateList.vue') },
  { path: '/estimates/new', component: () => import('../views/EstimateNew.vue') },
  { path: '/estimates/sash/new', component: () => import('../views/SashNew.vue') },
  { path: '/estimates/:itgEstiNo', component: () => import('../views/EstimateDetail.vue') },

  // 거래처
  { path: '/clients', component: () => import('../views/ClientList.vue') },
  { path: '/clients/new', component: () => import('../views/ClientNew.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.token) return { path: '/login' }
  if (to.path === '/login' && auth.token) return { path: '/estimates' }
})

export default router
