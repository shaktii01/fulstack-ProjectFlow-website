# ProjectFlow Full Stack Task Management

## Deployment Notes

If the frontend is hosted on Netlify and the backend is hosted on Render, make sure both sides are configured for cross-site cookies and the correct API origin.

### Frontend

Set this environment variable in Netlify:

```env
VITE_API_BASE_URL=https://projectflow-full-stack-task-management-1.onrender.com/api
```

### Backend

Set these environment variables in Render:

```env
FRONTEND_URL=https://projectfolw.netlify.app
FRONTEND_URLS=https://projectfolw.netlify.app,http://localhost:5173,http://localhost:3000
NODE_ENV=production
```

### Why this matters

- The backend must allow the Netlify origin through CORS.
- The auth cookie must use secure cross-site settings in production.
- Netlify needs an SPA redirect so routes like `/reset-password/:token` do not 404 on refresh.
