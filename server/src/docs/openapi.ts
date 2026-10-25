
const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'BookLeaf Author Support API',
      version: '1.0.0',
      description:
        'REST API for author book and royalty information, support tickets, and admin ticket management.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Health' },
      { name: 'Authentication' },
      { name: 'Books' },
      { name: 'Author Tickets' },
      { name: 'Admin Tickets' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid ticket details.' },
          },
          required: ['success', 'message'],
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Check API health',
          responses: {
            '200': { description: 'API is running' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Log in as an author or admin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '400': { description: 'Invalid request' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get the current user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Current user returned' },
            '401': { description: 'Missing or invalid token' },
          },
        },
      },
      '/api/books': {
        get: {
          tags: ['Books'],
          summary: "List the authenticated author's books",
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: "Author's books returned" },
            '401': { description: 'Authentication required' },
          },
        },
      },
      '/api/books/royalties/summary': {
        get: {
          tags: ['Books'],
          summary: "Get the authenticated author's royalty summary",
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Royalty summary returned' },
            '401': { description: 'Authentication required' },
          },
        },
      },
      '/api/tickets': {
        get: {
          tags: ['Author Tickets'],
          summary: "List the authenticated author's tickets",
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: "Author's tickets returned" },
            '401': { description: 'Authentication required' },
          },
        },
        post: {
          tags: ['Author Tickets'],
          summary: 'Create a support ticket',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['subject', 'description', 'category'],
                  properties: {
                    bookId: {
                      type: 'string',
                      description: 'Optional book ID; omit for a general inquiry.',
                    },
                    subject: { type: 'string', minLength: 5, maxLength: 150 },
                    description: { type: 'string', minLength: 10, maxLength: 5000 },
                    category: {
                      type: 'string',
                      enum: [
                        'ROYALTY_PAYMENTS',
                        'ISBN_METADATA',
                        'PRINTING_QUALITY',
                        'DISTRIBUTION_AVAILABILITY',
                        'BOOK_STATUS_PRODUCTION',
                        'GENERAL_INQUIRY',
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Ticket created' },
            '400': { description: 'Validation failed' },
            '401': { description: 'Authentication required' },
          },
        },
      },
      '/api/admin/tickets': {
        get: {
          tags: ['Admin Tickets'],
          summary: 'List and filter tickets',
          description: 'Admin role required.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
              },
            },
            {
              name: 'priority',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
              },
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
            },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: {
            '200': { description: 'Ticket queue returned' },
            '401': { description: 'Authentication required' },
            '403': { description: 'Admin role required' },
          },
        },
      },
      '/api/admin/tickets/{ticketId}/assign-self': {
        patch: {
          tags: ['Admin Tickets'],
          summary: 'Assign a ticket to the current admin',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Ticket assigned' },
            '401': { description: 'Authentication required' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
          },
        },
      },
      '/api/admin/tickets/{ticketId}/status': {
        patch: {
          tags: ['Admin Tickets'],
          summary: 'Update ticket status',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Status updated' },
            '400': { description: 'Invalid status' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
          },
        },
      },
      '/api/admin/tickets/{ticketId}/notes': {
        get: {
          tags: ['Admin Tickets'],
          summary: 'Get internal notes',
          description: 'Admin-only notes; not visible to authors.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Internal notes returned' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
          },
        },
        post: {
          tags: ['Admin Tickets'],
          summary: 'Add an internal note',
          description: 'The note is not sent to the author.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: { content: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Internal note added' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
          },
        },
      },
      '/api/admin/tickets/{ticketId}/responses': {
        post: {
          tags: ['Admin Tickets'],
          summary: 'Send a public response to the author',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: { content: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Public response sent' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
          },
        },
      },
      '/api/admin/tickets/{ticketId}/draft-reply': {
        post: {
          tags: ['Admin Tickets'],
          summary: 'Generate an AI-assisted reply draft',
          description: 'Review and edit the draft before sending it to the author.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Draft generated' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
            '502': { description: 'AI service unavailable' },
          },
        },
      },
      '/api/admin/tickets/{ticketId}/classification': {
        patch: {
          tags: ['Admin Tickets'],
          summary: 'Update ticket category and priority',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'ticketId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    priority: {
                      type: 'string',
                      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
                    },
                  },
                  minProperties: 1,
                },
              },
            },
          },
          responses: {
            '200': { description: 'Classification updated' },
            '400': { description: 'Invalid classification' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Ticket not found' },
          },
        },
      },
    },
  } as const;
  
  export default openApiSpec;