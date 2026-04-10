import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { ensureCsrfToken } from '@/services/http/client';

const useAuthBootstrap = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await ensureCsrfToken();
      } finally {
        await checkAuth();
      }
    };

    bootstrapAuth();
  }, [checkAuth]);
};

export default useAuthBootstrap;
