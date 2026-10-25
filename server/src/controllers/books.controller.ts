
import type { RequestHandler } from 'express';
import { booksService } from '../services/books.service.js';

export const getAuthorBooks: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const authorId = req.user!.userId;
    const books = await booksService.getAuthorBooks(authorId);

    res.status(200).json({
      success: true,
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorRoyaltySummary: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const authorId = req.user!.userId;
    const summary =
      await booksService.getAuthorRoyaltySummary(authorId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};