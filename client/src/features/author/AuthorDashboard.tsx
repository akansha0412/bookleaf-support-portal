import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "../../lib/api";
import type { Auth } from "../auth/auth.types";

import { AuthorSupportTickets } from './AuthorSupportTickets';

type DataRecord = Record<string, unknown>;

type BooksResponse = {
  success: boolean;
  data: {
    books: DataRecord[];
  };
};

type RoyaltyResponse = {
  success: boolean;
  data: DataRecord;
};

type AuthorDashboardProps = {
  auth: Auth;
  onLogout: () => void;
};

function getText(record: DataRecord, keys: string[], fallback = "—"): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function formatLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string") {
    return value;
  }

  return "—";
}

function formatCurrency(value: unknown): string {
  if (typeof value !== "number") {
    return typeof value === "string" ? value : "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function AuthorDashboard({ auth, onLogout }: AuthorDashboardProps) {
  const [books, setBooks] = useState<DataRecord[]>([]);
  const [royalties, setRoyalties] = useState<DataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const [booksResult, royaltyResult] = await Promise.all([
        apiRequest<BooksResponse>("/api/books", {}, auth.token),
        apiRequest<RoyaltyResponse>(
          "/api/books/royalties/summary",
          {},
          auth.token,
        ),
      ]);

      setBooks(booksResult.data.books);
      setRoyalties(royaltyResult.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const [booksResult, royaltyResult] = await Promise.all([
          apiRequest<BooksResponse>("/api/books", {}, auth.token),
          apiRequest<RoyaltyResponse>(
            "/api/books/royalties/summary",
            {},
            auth.token,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setBooks(booksResult.data.books);
        setRoyalties(royaltyResult.data);
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [auth.token]);

  const summaryEntries = royalties
  ? [
      {
        label: 'Books',
        value: String(royalties.bookCount ?? 0),
      },
      {
        label: 'Total royalties earned',
        value: formatCurrency(royalties.totalRoyaltyEarned),
      },
      {
        label: 'Royalties paid',
        value: formatCurrency(royalties.royaltyPaid),
      },
      {
        label: 'Royalties pending',
        value: formatCurrency(royalties.royaltyPending),
      },
    ]
  : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-white">
              b.
            </div>
            <div>
              <p className="font-bold tracking-tight">BookLeaf</p>
              <p className="text-xs text-slate-500">Author Support Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        <section>
          <p className="text-sm font-semibold text-emerald-700">
            AUTHOR WORKSPACE
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome, {auth.user.name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep track of your books, royalties, and publishing progress.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadDashboard();
              }}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
          >
            Loading your books and royalty information…
          </div>
        ) : (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Royalty overview</h2>
                <span className="text-xs text-slate-500">
                  Your account summary
                </span>
              </div>

              {summaryEntries.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {summaryEntries.map((item) => (
                    <article
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-sm text-slate-500">
                        {formatLabel(item.label)}
                      </p>
                      <p className="mt-3 break-words text-2xl font-bold tracking-tight">
                        {typeof item.value === "number" &&
                        /royalt|amount|earning|paid|pending|balance/i.test(item.label)
                          ? formatCurrency(item.value)
                          : formatValue(item.value)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  No royalty summary is available yet.
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">My books</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Books associated with your author account.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  {books.length} {books.length === 1 ? "book" : "books"}
                </span>
              </div>

              {books.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <h3 className="font-semibold">No books found</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Your published and in-progress books will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {books.map((book, index) => {
                    const id = getText(book, ["id"], String(index));
                    const title = getText(book, ["title"], "Untitled book");
                    const isbn = getText(book, ["isbn"]);
                    const genre = getText(book, ["genre"]);
                    const status = getText(book, ["status"], "Unavailable");

                    return (
                      <article
                        key={id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-6 w-6"
                          >
                            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" />
                            <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h7M8 10h7" />
                          </svg>
                        </div>

                        <h3 className="mt-4 text-lg font-bold">{title}</h3>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          ISBN: {isbn}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                            {genre}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                            {formatLabel(status)}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs text-slate-500">
                              Copies sold
                            </p>
                            <p className="mt-1 font-semibold">
                              {getText(book, ["totalCopiesSold"], "0")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">MRP</p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(book.mrp)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Royalty earned
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(book.totalRoyaltyEarned)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Royalty pending
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(book.royaltyPending)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Royalty paid
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(book.royaltyPaid)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Last payout
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {getText(
                                book,
                                ["lastRoyaltyPayoutDate"],
                                "No payout recorded",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Publishing status
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {formatLabel(status)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
        <AuthorSupportTickets
  auth={auth}
  books={books.map((book) => ({
    id: String(book.id),
    title: String(book.title),
  }))}
/>
      </main>
    </div>
  );
}
