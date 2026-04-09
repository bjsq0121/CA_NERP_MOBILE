<template>
  <div class="app-shell">
    <header class="app-header" v-if="auth.user">
      <h1>CA NERP Mobile</h1>
      <div class="user">
        {{ auth.user.user_nm }}
        <span class="badge" style="margin-left:6px">{{ auth.role }}</span>
        <button class="btn secondary" style="width:auto;padding:6px 10px;margin-left:8px;font-size:12px" @click="logout">로그아웃</button>
      </div>
    </header>
    <main class="app-main">
      <!-- 섹션 내부 탭: 목록 / 신규 -->
      <div v-if="auth.user && section" class="section-tabs">
        <router-link :to="section.listPath">{{ section.listLabel }}</router-link>
        <router-link :to="section.newPath">{{ section.newLabel }}</router-link>
      </div>
      <router-view />
    </main>
    <nav class="app-tabbar" v-if="auth.user">
      <router-link to="/clients">거래처</router-link>
      <router-link to="/estimates">판매견적</router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const section = computed(() => {
  if (route.path.startsWith('/clients')) {
    return { listPath: '/clients', newPath: '/clients/new', listLabel: '거래처 조회', newLabel: '거래처 등록' }
  }
  if (route.path.startsWith('/estimates')) {
    return { listPath: '/estimates', newPath: '/estimates/new', listLabel: '견적 목록', newLabel: '신규 견적' }
  }
  return null
})

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<!-- styles moved to styles.css -->
