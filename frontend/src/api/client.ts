import axios from 'axios';

const client = axios.create({
    baseURL: 'https://outpostfastcourier.onrender.com/api',
    // headers: { 'Bypass-Tunnel-Reminder': 'true' } // Not needed for localhost
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
