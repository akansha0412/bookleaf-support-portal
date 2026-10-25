# BookLeaf Author Support Portal — Approach & Technical Decisions

## Approach and Priorities

I prioritised delivering the core author and administrator workflows first. Authors can access their books and royalty summaries, raise book-specific or general support tickets, and track ticket status and public responses. Administrators can filter the ticket queue, review AI classifications, assign tickets, update statuses, add private internal notes, and respond to authors.

I used React and TypeScript for the frontend and Node.js, Express, and TypeScript for the backend, with PostgreSQL and Prisma for persistence. The backend separates routes, controllers, services, and repositories to keep HTTP handling, business logic, data access, and AI integration maintainable. JWT authentication and role-based middleware protect the APIs, while authors' access is restricted to their own data.

## AI Integration and Trade-offs

AI integration received particular attention because it can reduce repetitive support work and improve response consistency. Gemini classifies tickets into the six required categories and four priority levels. It also generates suggested replies using the supplied BookLeaf knowledge base, including royalty rules, ISBN escalation, printing policies, distribution timelines, and communication guidelines.

I used structured output and schema validation for classification, bounded response lengths, and prompts that prohibit unsupported claims. AI-generated replies remain editable drafts for administrator review rather than being sent automatically. Classification failures are handled without blocking ticket creation, allowing support workflows to continue when the AI service is unavailable.

For this assignment, I prioritised a lightweight model and straightforward prompt-based knowledge grounding over a more complex retrieval-augmented generation system. This keeps the implementation simpler, although a larger knowledge base and more demanding production requirements would justify a dedicated retrieval and evaluation layer.

## Limitations and Future Improvements

The current implementation uses periodic polling for ticket updates rather than WebSockets or server-sent events. File attachment selection is present in the interface, but persistent, secure file storage remains future work. AI accuracy also requires evaluation against a labelled set of real or representative support tickets.

Given more time, I would expand automated coverage for authorization boundaries and ticket lifecycle edge cases, introduce real-time updates, add structured logging and monitoring, and strengthen deployment security and operational observability. I would also evaluate AI classification accuracy, track token usage and cost, and use human corrections to improve prompts and quality.

For production, I would deploy the frontend and API separately, use a managed PostgreSQL database with backups, manage secrets through the hosting platform, enforce HTTPS and rate limits, and establish monitoring and alerting. These improvements would support reliability and scale while preserving the human oversight required for sensitive support decisions.
