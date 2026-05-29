import axios from 'axios';

// Unified backend handles both P1 and P2 routes on the same port
const api2 = axios.create({
  baseURL: import.meta.env.VITE_P2_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  withCredentials: true, // required for httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
});

export default api2;
