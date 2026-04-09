import http from './index'

export function login(userId, userPswd) {
  return http.post('/mobile/auth/login', { userId, userPswd })
}

export function verify() {
  return http.post('/mobile/auth/verify')
}
