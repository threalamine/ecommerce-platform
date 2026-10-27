import axios from 'axios'

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url ?? ''
        const isAuthRoute =
        url.includes('/login') || url.includes('/register') || url.includes('/logout')

        // Token rejected by the server: clear it and send the user to the login page
        if (error.response?.status === 401 && !isAuthRoute) {
        localStorage.removeItem('token')
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'
        }
        }

        return Promise.reject(error)
    },
)

export default client