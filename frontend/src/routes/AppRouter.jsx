import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { protectedRouteGroups, publicRoutes } from '@/routes/routeConfig';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {protectedRouteGroups.map((group, index) => (
          <Route key={`protected-${index}`} element={group.element}>
            {group.children.map((childRoute) => (
              <Route key={childRoute.path} path={childRoute.path} element={childRoute.element} />
            ))}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
