import { defineStore } from 'pinia'
import { login as apiLogin } from '../api/auth'

const STORAGE_KEY = 'ca_nerp_mobile_auth'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: '', user: null }
    return JSON.parse(raw)
  } catch {
    return { token: '', user: null }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => loadInitial(),
  getters: {
    role: (s) => s.user?.role || '',
    isAdmin: (s) => s.user?.role === 'ADMIN',
    bzpc: (s) => s.user?.bzpc || '',
    bzpcNm: (s) => s.user?.bzpcNm || '',
    vkgrp: (s) => s.user?.vkgrp || '',
    vkbur: (s) => s.user?.vkbur || '',
  },
  actions: {
    async login(userId, userPswd) {
      const { data } = await apiLogin(userId, userPswd)
      this.token = data.token
      this.user = {
        user_id: data.user_id,
        user_nm: data.user_nm,
        role: data.role,
        bzpc: data.bzpc,
        bzpcNm: data.bzpcNm,
        vkgrp: data.vkgrp,
        vkgrpNm: data.vkgrpNm,
        dvpc: data.dvpc,
        vkbur: data.vkbur,
        auth_grp: data.auth_grp,
      }
      this.persist()
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: this.token, user: this.user }))
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
