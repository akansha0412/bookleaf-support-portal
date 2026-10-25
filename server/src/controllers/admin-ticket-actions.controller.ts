
import type { Request, Response, NextFunction } from 'express';
import { ticketsService } from '../services/tickets.service.js';
import { z } from 'zod';
import type { TicketStatus } from '@prisma/client';

export const assignTicketToSelf = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const ticket = await ticketsService.assignTicketToSelf(
      ticketId as string,
      req.user!.userId,
    );

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const { status } = updateStatusSchema.parse(req.body);

    const ticket = await ticketsService.updateTicketStatus(
      ticketId as string,
      status as TicketStatus,
    );

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


const internalNoteSchema = z.object({
  message: z.string().trim().min(1).max(5000),
});

export const addInternalNote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const { message } = internalNoteSchema.parse(req.body);

    const note = await ticketsService.addInternalNote(
      ticketId as string,
      message,
    );

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalNotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const notes = await ticketsService.getInternalNotes(ticketId as string);

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};


const publicResponseSchema = z.object({
  message: z.string().trim().min(1).max(5000),
});

export const sendPublicResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required',
      });
      return;
    }

    const { message } = publicResponseSchema.parse(req.body);

    const response = await ticketsService.sendPublicResponse(
      ticketId as string,
      message,
    );

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export async function generateTicketReplyDraft(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required.',
      });
      return;
    }

    const draft = await ticketsService.generateTicketReplyDraft(ticketId as string);

    res.status(200).json({
      success: true,
      data: { draft },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketClassification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ticketId = req.params.ticketId;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        message: 'Ticket ID is required.',
      });
      return;
    }

    const schema = z.object({
      category: z.enum([
        'ROYALTY_PAYMENTS',
        'ISBN_METADATA',
        'PRINTING_QUALITY',
        'DISTRIBUTION_AVAILABILITY',
        'BOOK_STATUS_PRODUCTION',
        'GENERAL_INQUIRY',
      ]),
      priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid category or priority.',
        errors: result.error.flatten(),
      });
      return;
    }

    const ticket = await ticketsService.updateTicketClassification(
      ticketId as string,
      result.data.category,
      result.data.priority,
    );

    res.status(200).json({
      success: true,
      message: 'Ticket classification updated successfully.',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
}