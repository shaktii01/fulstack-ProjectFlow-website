import React from 'react';
import AppProviders from '@/app/AppProviders';
import useAuthBootstrap from '@/hooks/useAuthBootstrap';
import AppRouter from '@/routes/AppRouter';

const App = () => {
  useAuthBootstrap();

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;
