import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 15_000
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data ?? error)
)
