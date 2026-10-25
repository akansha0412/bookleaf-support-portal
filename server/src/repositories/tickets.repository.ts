
import { prisma } from '../lib/prisma.js';
import type { Prisma, TicketCategory, TicketPriority } from '@prisma/client';
import type { TicketStatus } from '@prisma/client';
import type { TicketClassification } from '../services/gemini.service.js';

interface CreateTicketData {
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

export const ticketsRepository = {
  create(data: CreateTicketData) {
    return prisma.ticket.create({
    data: {
        authorId: data.authorId,
        ...(data.bookId ? { bookId: data.bookId } : {}),
        subject: data.subject,
        description: data.description,
        category: data.category,
    },
      select: {
        id: true,
        subject: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        bookId: true,
        createdAt: true,
      },
    });
  },

  findByAuthorId(authorId: string) {
    return prisma.ticket.findMany({
      where: { authorId },
      select: {
        id: true,
        subject: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        bookId: true,
        createdAt: true,
        updatedAt: true,
        responses: {
          select: {
            id: true,
            message: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },


    saveAiClassification(
    ticketId: string,
    classification: TicketClassification,
  ) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiCategory: classification.category,
        aiPriority: classification.priority,
      },
      select: {
        id: true,
        subject: true,
        description: true,
        category: true,
        aiCategory: true,
        priority: true,
        aiPriority: true,
        status: true,
        bookId: true,
        createdAt: true,
      },
    });
  },

  async bookBelongsToAuthor(
    bookId: string,
    authorId: string,
  ): Promise<boolean> {
    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        authorId,
      },
      select: {
        id: true,
      },
    });
  
    return book !== null;
  },

  findAllForAdmin(filters: {
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
    const where: Prisma.TicketWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };
  
    return prisma.ticket.findMany({
      where,
      select: {
        id: true,
        subject: true,
        description: true,
        category: true,
        aiCategory: true,
        priority: true,
        aiPriority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        bookId: true,
        author: {
          select: { id: true, name: true, email: true },
        },
        book: {
          select: { id: true, title: true, isbn: true },
        },
        assignedAdmin: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
  },


async assignToAdmin(ticketId: string, adminId: string) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedAdminId: adminId,
      },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        assignedAdminId: true,
        updatedAt: true,
      },
    });
  },


async updateStatus(ticketId: string, status: TicketStatus) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
    select: {
      id: true,
      subject: true,
      status: true,
      updatedAt: true,
    },
  });
},


async addInternalNote(
  ticketId: string,
  message: string,
) {
  return prisma.internalNote.create({
    data: {
      ticketId,
      message,
    },
    select: {
      id: true,
      ticketId: true,
      message: true,
      createdAt: true,
    },
  });
},

async findInternalNotes(ticketId: string) {
  return prisma.internalNote.findMany({
    where: { ticketId },
    select: {
      id: true,
      ticketId: true,
      message: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
},


async addPublicResponse(
  ticketId: string,
  message: string,
) {
  return prisma.ticketResponse.create({
    data: {
      ticketId,
      message,
      isAiDraft: false,
    },
    select: {
      id: true,
      ticketId: true,
      message: true,
      isAiDraft: true,
      createdAt: true,
    },
  });
},

findById(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          isbn: true,
        },
      },
    },
  });
},

updateClassification(
  ticketId: string,
  category: TicketCategory,
  priority: TicketPriority,
) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      category,
      priority,
    },
  });
},
};