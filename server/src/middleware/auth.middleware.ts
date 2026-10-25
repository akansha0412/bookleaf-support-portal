
import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export type AuthenticatedUser = {
  userId: string;
  role: 'AUTHOR' | 'ADMIN';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    });
    return;
  }

  const token = authorization.slice('Bearer '.length);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'Authentication is not configured.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      !('userId' in decoded) ||
      !('role' in decoded) ||
      typeof (decoded as JwtPayload).userId !== 'string' ||
      !['AUTHOR', 'ADMIN'].includes(
        String((decoded as JwtPayload).role),
      )
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
      return;
    }

    req.user = {
      userId: (decoded as JwtPayload).userId as string,
      role: (decoded as JwtPayload).role as 'AUTHOR' | 'ADMIN',
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}