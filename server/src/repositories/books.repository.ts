
import { prisma } from '../lib/prisma.js';

export const booksRepository = {
  findByAuthorId(authorId: string) {
    return prisma.book.findMany({
      where: { authorId },
      select: {
        id: true,
        title: true,
        isbn: true,
        genre: true,
        status: true,
        mrp: true,
        totalCopiesSold: true,
        totalRoyaltyEarned: true,
        royaltyPaid: true,
        royaltyPending: true,
        lastRoyaltyPayoutDate: true,
        availableOn: true,
      },
      orderBy: { title: 'asc' },
    });
  },

  async getRoyaltySummary(authorId: string) {
    const [totals, bookCount] = await Promise.all([
      prisma.book.aggregate({
        where: { authorId },
        _sum: {
          totalRoyaltyEarned: true,
          royaltyPaid: true,
          royaltyPending: true,
        },
      }),
      prisma.book.count({
        where: { authorId },
      }),
    ]);

    return {
      bookCount,
      totalRoyaltyEarned: totals._sum.totalRoyaltyEarned ?? 0,
      royaltyPaid: totals._sum.royaltyPaid ?? 0,
      royaltyPending: totals._sum.royaltyPending ?? 0,
    };
  },
};