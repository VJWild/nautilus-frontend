import axios from 'axios';

const nautilusApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

nautilusApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('nautilus_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default nautilusApi;