
import { booksRepository } from '../repositories/books.repository.js';

export const booksService = {
  getAuthorBooks(authorId: string) {
    return booksRepository.findByAuthorId(authorId);
  },

  getAuthorRoyaltySummary(authorId: string) {
    return booksRepository.getRoyaltySummary(authorId);
  },
};