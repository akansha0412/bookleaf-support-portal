
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ticketsService } from '../services/tickets.service.js';

const filtersSchema = z.object({
  status: z.enum([
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ]).optional(),
  category: z.enum([
    'ROYALTY_PAYMENTS',
    'ISBN_METADATA',
    'PRINTING_QUALITY',
    'DISTRIBUTION_AVAILABILITY',
    'BOOK_STATUS_PRODUCTION',
    'GENERAL_INQUIRY',
  ]).optional(),
  priority: z.enum([
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
  ]).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

export const getAdminTickets: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = filtersSchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid ticket filters.',
        errors: parsed.error.flatten(),
      });
      return;
    }

    const { from, to, ...otherFilters } = parsed.data;
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && toDate && fromDate > toDate) {
      res.status(400).json({
        success: false,
        message: '"from" must be before or equal to "to".',
      });
      return;
    }

    const tickets = await ticketsService.getAdminTickets({
      status: otherFilters.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
      category: otherFilters.category as 'ROYALTY_PAYMENTS' | 'ISBN_METADATA' | 'PRINTING_QUALITY' | 'DISTRIBUTION_AVAILABILITY' | 'BOOK_STATUS_PRODUCTION' | 'GENERAL_INQUIRY',
      priority: otherFilters.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      ...(fromDate ? { from: fromDate } : {}),
      ...(toDate ? { to: toDate } : {}),
    });

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    next(error);
  }
};