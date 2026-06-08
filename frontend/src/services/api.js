import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

// Auto-refresh token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const refresh = localStorage.getItem('refresh_token')
            if (refresh) {
                try {
                    const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh })
                    localStorage.setItem('access_token', data.access)
                    original.headers.Authorization = `Bearer ${data.access}`
                    return api(original)
                } catch {
                    localStorage.clear()
                    window.location.href = '/login'
                }
            } else {
                localStorage.clear()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    adminLogin: (data) => api.post('/auth/login/', data),
    logout: (data) => api.post('/auth/logout/', data),
    getProfile: () => api.get('/auth/profile/'),
    refreshToken: (data) => api.post('/auth/token/refresh/', data),
}

// ─── Products ───────────────────────────────────────────────────────────────
export const productAPI = {
    getAll: (params) => api.get('/products/', { params }),
    getOne: (id) => api.get(`/products/${id}/`),
    adminGetAll: (params) => api.get('/products/admin/', { params }),
    create: (data) => api.post('/products/admin/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.patch(`/products/admin/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => api.delete(`/products/admin/${id}/`),
    updateStock: (id, data) => api.post(`/products/admin/${id}/add-stock/`, data),
    getStockHistory: (id) => api.get(`/products/admin/${id}/stock-history/`),
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export const cartAPI = {
    get: () => api.get('/cart/'),
    add: (data) => api.post('/cart/', data),
    update: (id, data) => api.patch(`/cart/${id}/`, data),
    remove: (id) => api.delete(`/cart/${id}/`),
    clear: () => api.delete('/cart/'),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
    create: (data) => api.post('/orders/create/', data),
    getAll: () => api.get('/orders/'),
    getOne: (id) => api.get(`/orders/${id}/`),
    adminGetAll: (params) => api.get('/orders/admin/', { params }),
    adminUpdateStatus: (id, data) => api.patch(`/orders/admin/${id}/`, data),
}

// ─── Transactions ────────────────────────────────────────────────────────────
export const transactionAPI = {
    create: (data) => api.post('/transactions/', data),
    getAll: () => api.get('/transactions/'),
    adminGetAll: (params) => api.get('/transactions/admin/', { params }),
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────
export const adminAPI = {
    getDashboard: () => api.get('/admin-panel/dashboard/'),
    getSalesAnalytics: (params) => api.get('/admin-panel/sales/', { params }),
    getRevenue: (params) => api.get('/admin-panel/revenue/', { params }),
    getUsers: () => api.get('/admin-panel/users/'),
}

export default api