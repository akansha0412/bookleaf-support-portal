
import { Router } from 'express';
import {
  getAuthorBooks,
  getAuthorRoyaltySummary,
} from '../controllers/books.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const booksRouter = Router();

booksRouter.use(authenticateToken);

booksRouter.get('/royalties/summary', getAuthorRoyaltySummary);
booksRouter.get('/', getAuthorBooks);

export default booksRouter;