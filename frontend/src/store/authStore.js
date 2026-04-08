import { create } from 'zustand';
import api from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true initially to check user session on mount

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    set({ user: data, isAuthenticated: true, isLoading: false });
    return data;
  },

  registerCompany: async (info) => {
    const { data } = await api.post('/auth/register/company', info);
    set({ user: data, isAuthenticated: true, isLoading: false });
    return data;
  },

  registerEmployee: async (info) => {
    const { data } = await api.post('/auth/register/employee', info);
    set({ user: data, isAuthenticated: true, isLoading: false });
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/session');
      set({
        user: data.user,
        isAuthenticated: Boolean(data.user),
        isLoading: false,
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
