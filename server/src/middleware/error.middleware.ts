
import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  // Invalid request body or query parameters
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Prisma could not find a record to update or delete
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
    return;
  }

  // Handle our application errors, such as Ticket not found
  const statusCode =
    typeof error?.statusCode === 'number'
      ? error.statusCode
      : 500;

  const safeStatusCode =
    statusCode >= 400 && statusCode < 600
      ? statusCode
      : 500;

  const message =
    safeStatusCode === 500
      ? 'Internal server error'
      : error instanceof Error
        ? error.message
        : 'Request failed';

  if (safeStatusCode === 500) {
    console.error('Unhandled API error:', error);
  }

  res.status(safeStatusCode).json({
    success: false,
    message,
  });
};