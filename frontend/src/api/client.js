import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('smart-task-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('smart-task-token')
      sessionStorage.removeItem('smart-task-user')
      window.dispatchEvent(new Event('auth-expired'))
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error) {
  const data = error.response?.data
  if (data?.fields) return Object.values(data.fields).join(' · ')
  return data?.message || error.message || 'Something went wrong. Please try again.'
}
