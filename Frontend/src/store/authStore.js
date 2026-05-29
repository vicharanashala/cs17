import { create } from 'zustand';
import api2 from '../lib/axiosP2';

const useAuthStore = create((set, get) => ({
  user: null,
  admin: null,
  loading: true, // true on initial load while we check /me

  // ── Student ─────────────────────────────────────────────────────────────
  checkAuth: async () => {
    try {
      const res = await api2.get('/auth/me');
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api2.post('/auth/login', { email, password });
    set({ user: res.data.user });
    return res.data.user;
  },

  logout: async () => {
    await api2.post('/auth/logout');
    set({ user: null });
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  checkAdminAuth: async () => {
    try {
      const res = await api2.get('/admin/auth/me');
      set({ admin: res.data.admin, loading: false });
    } catch {
      set({ admin: null, loading: false });
    }
  },

  adminLogin: async (email, password) => {
    const res = await api2.post('/admin/auth/login', { email, password });
    set({ admin: res.data.admin });
    return res.data.admin;
  },

  adminLogout: async () => {
    await api2.post('/admin/auth/logout');
    set({ admin: null });
  },
}));

export default useAuthStore;
