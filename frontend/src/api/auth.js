import axios from 'axios'

// Direct axios for auth (no interceptor loop)
const authClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

const unwrap = (res) => res.data?.data ?? res.data

export const authApi = {
  login:    (payload) => authClient.post('/auth/login',    payload).then(unwrap),
  register: (payload) => authClient.post('/auth/register', payload).then(unwrap),
  refresh:  (token)   => authClient.post('/auth/refresh',  {}, {
    headers: { 'Refresh-Token': token }
  }).then(unwrap),
}
