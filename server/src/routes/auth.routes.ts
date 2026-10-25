
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

import { authenticateToken } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';

const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    // if (!parsed.success) {
    //   res.status(400).json({
    //     success: false,
    //     message: 'Please provide a valid email and password.',
    //   });
    //   return;
    // }
    if (!parsed.success) {
        console.error('Login validation error:', parsed.error.flatten());
        console.error('Received request body:', req.body);
      
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email and password.',
          errors: parsed.error.flatten(),
        });
        return;
      }

    const { email, password } = parsed.data;

    const user = await prisma.author.findUnique({
      where: { email },
    });

    // Use the same response for an unknown email and wrong password.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured.');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '1h' },
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticateToken, async (req, res, next) => {
    try {
      const user = await prisma.author.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
  
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User account not found.',
        });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  });

  authRouter.get(
    '/admin-check',
    authenticateToken,
    allowRoles('ADMIN'),
    (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Admin access granted.',
      });
    },
  );

export default authRouter;