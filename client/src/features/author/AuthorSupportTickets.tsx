
import { useCallback, useEffect, useState } from 'react';

import { apiRequest } from '../../lib/api';
import type { Auth } from '../auth/auth.types';

type AuthorBook = {
  id: string;
  title: string;
};

type TicketCategory =
  | 'ROYALTY_PAYMENTS'
  | 'ISBN_METADATA'
  | 'PRINTING_QUALITY'
  | 'DISTRIBUTION_AVAILABILITY'
  | 'BOOK_STATUS_PRODUCTION'
  | 'GENERAL_INQUIRY';

type TicketResponse = {
  id: string;
  message: string;
  createdAt: string;
};

type AuthorTicket = {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: string;
  priority?: string;
  createdAt: string;
  book?: { id: string; title: string } | null;
  responses?: TicketResponse[];
};

type TicketsResult = {
  success: boolean;
  data: { tickets: AuthorTicket[] };
};

type CreateTicketResult = {
  success: boolean;
  data: { ticket: AuthorTicket };
};

type Props = {
  auth: Auth;
  books: AuthorBook[];
};

const categories: { value: TicketCategory; label: string }[] = [
  { value: 'ROYALTY_PAYMENTS', label: 'Royalty & Payments' },
  { value: 'ISBN_METADATA', label: 'ISBN & Metadata Issues' },
  { value: 'PRINTING_QUALITY', label: 'Printing & Quality' },
  {
    value: 'DISTRIBUTION_AVAILABILITY',
    label: 'Distribution & Availability',
  },
  {
    value: 'BOOK_STATUS_PRODUCTION',
    label: 'Book Status & Production Updates',
  },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
];

function labelFor(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

export function AuthorSupportTickets({ auth, books }: Props) {
  const [tickets, setTickets] = useState<AuthorTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  const [bookId, setBookId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<TicketCategory>('GENERAL_INQUIRY');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const loadTickets = useCallback(async () => {
    try {
      const result = await apiRequest<TicketsResult>(
        '/api/tickets',
        {},
        auth.token,
      );

      setTickets(result.data.tickets);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your support tickets.',
      );
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    let cancelled = false;

    async function fetchTickets() {
      try {
        const result = await apiRequest<TicketsResult>(
          '/api/tickets',
          {},
          auth.token,
        );

        if (!cancelled) {
          setTickets(result.data.tickets);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your support tickets.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchTickets();

    return () => {
      cancelled = true;
    };
  }, [auth.token]);


useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadTickets();
    }, 10000);
  
    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadTickets]);
  
  async function handleCreateTicket(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      const payload = {
        ...(bookId ? { bookId } : {}),
        subject: subject.trim(),
        description: description.trim(),
        category,
      };

      await apiRequest<CreateTicketResult>(
        '/api/tickets',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        auth.token,
      );

      setSubject('');
      setDescription('');
      setBookId('');
      setCategory('GENERAL_INQUIRY');
      setSelectedFiles([]);
      setSuccess('Your support ticket has been created.');

      await loadTickets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your support ticket.',
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Author support</h2>
        <p className="mt-1 text-sm text-slate-500">
          Raise a publishing question and track replies from our support team.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={handleCreateTicket}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="font-bold">Create a support ticket</h3>

          <div>
            <label
              htmlFor="ticket-book"
              className="mb-1.5 block text-sm font-medium"
            >
              Related book
            </label>
            <select
              id="ticket-book"
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">General / account-level inquiry</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ticket-category"
              className="mb-1.5 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as TicketCategory)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ticket-subject"
              className="mb-1.5 block text-sm font-medium"
            >
              Subject
            </label>
            <input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              minLength={5}
              maxLength={150}
              required
              placeholder="Briefly describe your issue"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {subject.length}/150
            </p>
          </div>

          <div>
            <label
              htmlFor="ticket-description"
              className="mb-1.5 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={10}
              maxLength={5000}
              required
              rows={5}
              placeholder="Tell us what happened and what help you need."
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {description.length}/5000
            </p>
          </div>

          <div>
            <label
              htmlFor="ticket-attachments"
              className="mb-1.5 block text-sm font-medium"
            >
              Attachments (optional)
            </label>
            <input
              id="ticket-attachments"
              type="file"
              multiple
              onChange={(event) =>
                setSelectedFiles(Array.from(event.target.files ?? []))
              }
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            <p className="mt-1 text-xs text-slate-400">
              UI demonstration only. Files are selected locally and are not uploaded.
            </p>
            {selectedFiles.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {selectedFiles.map((file) => (
                  <li key={`${file.name}-${file.size}`}>
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? 'Submitting…' : 'Submit support ticket'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">My tickets</h3>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadTickets();
              }}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading your tickets…
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold">No support tickets yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Your submitted requests will appear here.
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.book?.title ?? 'Account-level inquiry'} ·{' '}
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                    {labelFor(ticket.status)}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {ticket.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
                    {categories.find(
                      (item) => item.value === ticket.category,
                    )?.label ?? labelFor(ticket.category)}
                  </span>
                  {ticket.priority && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                      {labelFor(ticket.priority)} priority
                    </span>
                  )}
                </div>

                {ticket.responses && ticket.responses.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-sm font-semibold">
                      Support team replies
                    </p>
                    <div className="space-y-3">
                      {ticket.responses.map((response) => (
                        <div
                          key={response.id}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {response.message}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatDate(response.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}