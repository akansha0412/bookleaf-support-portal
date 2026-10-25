
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import app from './app.js';
import { prisma } from './lib/prisma.js';

describe('BookLeaf API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns a successful health check', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'BookLeaf API is running',
    });
  });

  it('returns JSON for an unknown API endpoint', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'API endpoint not found',
    });
  });

  it('rejects unauthenticated access to author books', async () => {
    const response = await request(app).get('/api/books');

    expect(response.status).toBe(401);
  });

  it('rejects unauthenticated access to admin tickets', async () => {
    const response = await request(app).get('/api/admin/tickets');

    expect(response.status).toBe(401);
  });
});