import { create } from 'zustand';
import {
  getAuthSession,
  login as loginRequest,
  logout as logoutRequest,
  registerCompany as registerCompanyRequest,
  registerEmployee as registerEmployeeRequest,
} from '@/services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true initially to check user session on mount

  login: async (credentials) => {
    const user = await loginRequest(credentials);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  registerCompany: async (info) => {
    const user = await registerCompanyRequest(info);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  registerEmployee: async (info) => {
    const user = await registerEmployeeRequest(info);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  logout: async () => {
    await logoutRequest();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const data = await getAuthSession();
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
