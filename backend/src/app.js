import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { getAllowedOrigins } from './utils/clientConfig.js';
import registerRoutes from './routes/index.js';
import { csrfProtection } from './middlewares/csrfMiddleware.js';
import { sanitizeRequest } from './middlewares/sanitizeMiddleware.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Middlewares
const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  credentials: true,
}));



app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(csrfProtection);

// Base Route
app.get('/', (req, res) => {
  res.send('ProjectFlow API is running...');
});

registerRoutes(app);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
