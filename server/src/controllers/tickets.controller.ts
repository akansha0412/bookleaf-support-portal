
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ticketsService } from '../services/tickets.service.js';

const createTicketSchema = z.object({
  bookId: z.string().min(1).optional(),
  subject: z.string().trim().min(5).max(150),
  description: z.string().trim().min(10).max(5000),
  category: z.enum([
    'ROYALTY_PAYMENTS',
    'ISBN_METADATA',
    'PRINTING_QUALITY',
    'DISTRIBUTION_AVAILABILITY',
    'BOOK_STATUS_PRODUCTION',
    'GENERAL_INQUIRY',
  ]),
});

export const createTicket: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = createTicketSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid ticket details.',
        errors: parsed.error.flatten(),
      });
      return;
    }

    const { bookId, ...ticketDetails } = parsed.data;

    const ticket = await ticketsService.createTicket({
    authorId: req.user!.userId,
    ...ticketDetails,
    ...(bookId ? { bookId } : {}),
    });

    res.status(201).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const tickets = await ticketsService.getAuthorTickets(
      req.user!.userId,
    );

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    next(error);
  }
};