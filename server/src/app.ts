
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import swaggerUi from 'swagger-ui-express';
import openApiSpec from './docs/openapi.js';

import { errorHandler } from './middleware/error.middleware.js';

import authRouter from './routes/auth.routes.js';
import booksRouter from './routes/books.routes.js';
import ticketsRouter from './routes/tickets.routes.js';
import adminTicketsRouter from './routes/admin-tickets.routes.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  }),
);

// IMPORTANT: Register body parsing before routes.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/admin/tickets', adminTicketsRouter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'BookLeaf API is running',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

app.use(errorHandler);

export default app;