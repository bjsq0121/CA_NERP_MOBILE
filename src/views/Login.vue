<template>
  <div style="padding: 40px 8px 0">
    <div class="card">
      <h2 style="margin:0 0 16px;font-size:18px">로그인</h2>
      <div class="field">
        <label>아이디</label>
        <input v-model="userId" autocomplete="username" placeholder="사용자 ID" />
      </div>
      <div class="field">
        <label>비밀번호</label>
        <input v-model="userPswd" type="password" autocomplete="current-password" @keyup.enter="submit" />
      </div>
      <button class="btn" :disabled="loading || !userId || !userPswd" @click="submit">
        {{ loading ? '로그인 중...' : '로그인' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const userId = ref('')
const userPswd = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(userId.value.trim(), userPswd.value)
    router.replace('/estimates')
  } catch (e) {
    error.value = e?.response?.data?.message || e?.response?.data?.error || '로그인 실패'
  } finally {
    loading.value = false
  }
}
</script>
