
import { Router } from 'express';
import {
  createTicket,
  getMyTickets,
} from '../controllers/tickets.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';

const ticketsRouter = Router();

ticketsRouter.use(authenticateToken);
ticketsRouter.use(allowRoles('AUTHOR'));

ticketsRouter.post('/', createTicket);
ticketsRouter.get('/', getMyTickets);

export default ticketsRouter;