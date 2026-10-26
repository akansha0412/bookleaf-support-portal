
## Project Overview

The portal provides two role-based experiences:

* **Author portal:** View books and royalty summaries, create support tickets linked to a book or a general inquiry, track ticket status, and view administrator responses.
* **Admin portal:** Review and filter the ticket queue, inspect AI classifications, assign tickets, update statuses, add private internal notes, respond to authors, and generate AI-assisted reply drafts.

AI features use Google's Gemini API. Generated classifications and replies are suggestions for the support team; administrators can review and edit responses before sending them.

## Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** Node.js, Express, TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JWT and password hashing with bcrypt
* **Validation:** Zod
* **AI integration:** Google Gemini API (`@google/genai`)
* **API documentation:** OpenAPI and Swagger UI
* **Testing:** Vitest and Supertest

## Architecture

The project separates the frontend from the backend.

* **Client:** Role-based author and admin interfaces, API calls, and ticket workflows.
* **Routes and middleware:** Define REST endpoints, authenticate requests, enforce role-based access, and handle errors.
* **Controllers:** Handle HTTP requests and responses.
* **Services:** Implement ticket workflows, business logic, AI classification, and reply drafting.
* **Repositories:** Encapsulate database operations.
* **Prisma:** Provides typed access to the PostgreSQL database.

This separation keeps HTTP handling, business rules, persistence, and AI integration independently maintainable.

## Features

### Author portal

* Email and password authentication.
* View the author's own books and royalty summary.
* Create book-specific or general support tickets.
* View ticket history, statuses, and public responses.
* Periodically refresh ticket data to reflect updates.

### Admin portal

* View and filter tickets by status, category, priority, and date.
* Review AI-generated classifications and priorities.
* Assign tickets to the current administrator.
* Update ticket status.
* Add internal notes that are not visible to authors.
* Send public responses.
* Generate and edit AI-assisted reply drafts.

### AI-assisted support

* Classifies tickets into six categories: Royalty & Payments, ISBN & Metadata Issues, Printing & Quality, Distribution & Availability, Book Status & Production Updates, and General Inquiry.
* Assigns a priority of Critical, High, Medium, or Low.
* Uses the BookLeaf knowledge base when drafting replies.
* Validates classification output against supported values.
* Handles classification failures without preventing ticket creation.

## BookLeaf Knowledge Base

AI-generated drafts are grounded in the supplied BookLeaf policies, including:

* **Royalties:** 80/20 split of net profit, quarterly calculations, payment within 45 days after quarter-end, and a ₹1,000 minimum payout threshold.
* **ISBN:** Errors are high priority and require production escalation.
* **Printing:** Standard turnaround of 5–7 business days; verified quality issues qualify for a free reprint.
* **Distribution:** New listings typically take 7–10 business days; stock synchronisation usually takes 24–48 hours.
* **Metadata:** Changes typically appear on platforms within 3–5 business days.
* **Production:** The workflow runs from manuscript receipt through editing (if opted), cover design, typesetting, proofreading, ISBN assignment, printing, distribution setup, and publication.

The AI is instructed not to invent account-specific information or claim an action has been completed without confirmation. Administrators review and edit drafts before sending them.

## Local Setup

### Prerequisites

* Node.js and npm
* PostgreSQL
* A Gemini API key for AI features

### 1. Clone the repository

```bash
git clone <PUBLIC_REPOSITORY_URL>
cd bookleaf-support-portal
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create `server/.env` using the following template:

```dotenv
PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bookleaf"
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@bookleaf.local
ADMIN_PASSWORD=replace_with_a_local_admin_password
AUTHOR_DEMO_PASSWORD=replace_with_a_local_author_password
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

Replace the database credentials and secrets with your own local values. Never commit `.env` or publish real API keys or passwords.

Create the PostgreSQL database named `bookleaf`, then run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed script loads the supplied sample dataset and creates the demo author, book, and administrator records.

### 3. Start the backend

From `server/`:

```bash
npm run dev
```

The API runs at `http://localhost:4000` by default.

Health check: `http://localhost:4000/api/health`

API documentation: `http://localhost:4000/api-docs`

### 4. Configure and start the frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

Ensure the frontend API configuration points to the local backend. For a deployed environment, configure the frontend and backend URLs to match the hosting setup.

## Demo Access

For the local demo, use the administrator and author accounts created by the seed process. Their configured emails and passwords must match the local environment and seed implementation.

**Live demo:** https://bookleaf-support-portal-lac.vercel.app.


## API Documentation

When the backend is running locally, Swagger UI is available at:

`http://localhost:4000/api-docs`

The API includes authentication, author book and royalty endpoints, author ticket endpoints, and administrator ticket-management actions. Protected endpoints require a valid bearer token, and administrator routes enforce role-based access.

## AI Design Decisions

* **Structured classification:** Gemini returns a category and priority constrained to supported values; Zod validates the response.
* **Knowledge-grounded drafting:** The supplied BookLeaf policies and communication guidelines are included in the reply-generation prompt.
* **Human review:** AI-generated responses are drafts rather than automatically sent messages.
* **Graceful degradation:** Ticket creation should continue when classification fails; administrators can handle tickets manually when AI features are unavailable.
* **Cost awareness:** Use a lightweight configured model, bound output tokens, and avoid unnecessary AI calls.

## Running Checks

From `server/`:

```bash
npm run build
npm test
```

These commands build the TypeScript backend and run the configured automated test suite.

## Known Limitations and Future Improvements

* Ticket attachment selection is currently UI-only; persistent file uploads and secure storage remain future work.
* Ticket refresh uses periodic polling rather than WebSockets or server-sent events.
* Automated test coverage can be expanded to include author data isolation, full ticket lifecycle scenarios, AI failure cases, and permission boundaries.
* Production deployment should include managed database backups, monitoring, structured logging, rate limiting, and secret management.
* AI classification quality should be evaluated against a labelled ticket dataset, with human corrections used to improve reliability.

## Security Notes

* Keep API keys and database credentials in environment variables or a managed secret store.
* Use HTTPS in production.
* Apply authentication and role-based authorization to protected endpoints.
* Restrict author data access to the authenticated author.
* Keep administrator-only internal notes separate from public author responses.
* Use dedicated demo credentials and never expose real user data in the public demo.

