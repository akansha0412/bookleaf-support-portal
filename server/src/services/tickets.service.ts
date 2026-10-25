
import { ticketsRepository } from '../repositories/tickets.repository.js';
import { geminiService } from './gemini.service.js';
import type { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';
import { generateReplyDraft } from './ai-reply.service.js';

interface CreateTicketInput {
  authorId: string;
  bookId?: string;
  subject: string;
  description: string;
  category:
    | 'ROYALTY_PAYMENTS'
    | 'ISBN_METADATA'
    | 'PRINTING_QUALITY'
    | 'DISTRIBUTION_AVAILABILITY'
    | 'BOOK_STATUS_PRODUCTION'
    | 'GENERAL_INQUIRY';
}

export const ticketsService = {
  async createTicket(input: CreateTicketInput) {
    if (input.bookId) {
      const belongsToAuthor =
        await ticketsRepository.bookBelongsToAuthor(
          input.bookId,
          input.authorId,
        );

      if (!belongsToAuthor) {
        throw new Error(
          'The selected book was not found for this author.',
        );
      }
    }

    // Save the ticket first. AI availability must not block submission.
    const ticket = await ticketsRepository.create(input);

    try {
      const classification = await geminiService.classifyTicket({
        subject: input.subject,
        description: input.description,
      });

      return await ticketsRepository.saveAiClassification(
        ticket.id,
        classification,
      );
    } catch (error) {
      console.error(
        'Ticket AI classification failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );

      return ticket;
    }
  },

  getAuthorTickets(authorId: string) {
    return ticketsRepository.findByAuthorId(authorId);
  },

  async getAdminTickets(filters: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    category?:
      | 'ROYALTY_PAYMENTS'
      | 'ISBN_METADATA'
      | 'PRINTING_QUALITY'
      | 'DISTRIBUTION_AVAILABILITY'
      | 'BOOK_STATUS_PRODUCTION'
      | 'GENERAL_INQUIRY';
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    from?: Date;
    to?: Date;
  }) {
    const tickets = await ticketsRepository.findAllForAdmin(filters); 
    const now = Date.now();
  const overdueThresholdMs = 48 * 60 * 60 * 1000;

  return tickets.map((ticket) => {
    const isUnresolved =
      ticket.status === 'OPEN' ||
      ticket.status === 'IN_PROGRESS';

    const isUrgent =
      ticket.priority === 'CRITICAL' ||
      ticket.priority === 'HIGH';

    const isOverdue =
      isUnresolved &&
      now - ticket.createdAt.getTime() > overdueThresholdMs;

    const urgency = isUrgent
      ? 'URGENT'
      : isOverdue
        ? 'OVERDUE'
        : 'NORMAL';

    return {
      ...ticket,
      isUnresolved,
      isUrgent,
      isOverdue,
      urgency,
    };
  });
},


async assignTicketToSelf(ticketId: string, adminId: string) {
    const ticket = await ticketsRepository.findAllForAdmin({});
  
    const exists = ticket.some((item) => item.id === ticketId);
  
    if (!exists) {
        const error = new Error('Ticket not found');
        Object.assign(error, { statusCode: 404 });
        throw error;
    }
  
    return ticketsRepository.assignToAdmin(ticketId, adminId);
  },


async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const tickets = await ticketsRepository.findAllForAdmin({});
    const exists = tickets.some((ticket) => ticket.id === ticketId);
  
    if (!exists) {
      const error = new Error('Ticket not found');
      Object.assign(error, { statusCode: 404 });
      throw error;
    }
  
    return ticketsRepository.updateStatus(ticketId, status);
  },


async addInternalNote(
    ticketId: string,
    message: string,
  ) {
    const tickets = await ticketsRepository.findAllForAdmin({});
    const exists = tickets.some((ticket) => ticket.id === ticketId);
  
    if (!exists) {
      const error = new Error('Ticket not found');
      Object.assign(error, { statusCode: 404 });
      throw error;
    }
  
    return ticketsRepository.addInternalNote(ticketId, message);
  },
  
  async getInternalNotes(ticketId: string) {
    const tickets = await ticketsRepository.findAllForAdmin({});
    const exists = tickets.some((ticket) => ticket.id === ticketId);
  
    if (!exists) {
        const error = new Error('Ticket not found');
        Object.assign(error, { statusCode: 404 });
        throw error;
    }
  
    return ticketsRepository.findInternalNotes(ticketId);
  },


async sendPublicResponse(
    ticketId: string,
    message: string,
  ) {
    const tickets = await ticketsRepository.findAllForAdmin({});
    const exists = tickets.some((ticket) => ticket.id === ticketId);
  
    if (!exists) {
      const error = new Error('Ticket not found');
      Object.assign(error, { statusCode: 404 });
      throw error;
    }
  
    return ticketsRepository.addPublicResponse(ticketId, message);
  },

  async generateTicketReplyDraft(ticketId: string) {
    const ticket = await ticketsRepository.findById(ticketId);
  
    if (!ticket) {
      throw Object.assign(new Error('Ticket not found.'), {
        statusCode: 404,
      });
    }
  
    return generateReplyDraft({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.aiCategory ?? ticket.category,
      priority: ticket.aiPriority ?? ticket.priority,
      ...(ticket.book?.title !== undefined && {
        bookTitle: ticket.book.title,
      }),
    });
  },

  async updateTicketClassification(
    ticketId: string,
    category: TicketCategory,
    priority: TicketPriority,
  ) {
    const ticket = await ticketsRepository.findById(ticketId);
  
    if (!ticket) {
      throw Object.assign(new Error('Ticket not found.'), {
        statusCode: 404,
      });
    }
  
    return ticketsRepository.updateClassification(
      ticketId,
      category,
      priority,
    );
  },

};

