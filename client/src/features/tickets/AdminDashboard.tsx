import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../lib/api';
import type { Auth } from '../auth/auth.types';
import type { Ticket, TicketsResult } from './tickets.types';
import { AdminSidebar } from '../../layouts/AdminSidebar';
import { AdminTopbar } from '../../layouts/AdminTopbar';
import { TicketQueue } from './TicketQueue';
import { StatCard } from '../../components/StatCard';

export function AdminDashboard({
  auth,
  onLogout,
}: {
  auth: Auth;
  onLogout: () => void;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (category) params.set('category', category);

    return params.toString();
  }, [status, priority, category]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTickets() {
      if (!hasLoadedOnce) {
        setLoading(true);
      }
      setError('');

      try {
        const result = await apiRequest<TicketsResult>(
          `/api/admin/tickets${queryString ? `?${queryString}` : ''}`,
          { signal: controller.signal },
          auth.token,
        );

        setTickets(result.data.tickets);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unable to load tickets.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setHasLoadedOnce(true);
        }
      }
    }

    void loadTickets();

    return () => controller.abort();
  }, [auth.token, queryString, refreshKey, hasLoadedOnce]);


useEffect(() => {
  const intervalId = window.setInterval(() => {
    setRefreshKey((value) => value + 1);
  }, 10000);

  return () => {
    window.clearInterval(intervalId);
  };
}, []);

  const visibleTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tickets;

    return tickets.filter((ticket) =>
      [
        ticket.subject,
        ticket.id,
        ticket.author.name,
        ticket.author.email,
        ticket.book?.title ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [tickets, search]);

  const openCount = tickets.filter((ticket) => ticket.status === 'OPEN').length;
  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === 'IN_PROGRESS',
  ).length;
  const urgentCount = tickets.filter((ticket) => ticket.isUrgent).length;
  const overdueCount = tickets.filter((ticket) => ticket.isOverdue).length;

  function clearFilters() {
    setStatus('');
    setPriority('');
    setCategory('');
    setSearch('');
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <AdminSidebar auth={auth} ticketCount={tickets.length} onLogout={onLogout} />

      <main className="lg:pl-64">
        <AdminTopbar auth={auth} onRefresh={() => setRefreshKey((value) => value + 1)} onLogout={onLogout} />

        <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                SUPPORT OPERATIONS
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Author support queue
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Triage requests, prioritize urgent issues, and help authors move forward.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Signed in as <span className="font-semibold text-slate-800">{auth.user.email}</span>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{error}</span>
              <button
                onClick={() => setRefreshKey((value) => value + 1)}
                className="font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Open tickets" value={openCount} detail="Awaiting review" icon="◷" />
            <StatCard label="In progress" value={inProgressCount} detail="Being worked on" icon="↗" />
            <StatCard label="Urgent priority" value={urgentCount} detail="Critical or high priority" icon="!" tone="red" />
            <StatCard label="Overdue" value={overdueCount} detail="Unresolved for over 48 hours" icon="⌛" tone="amber" />
          </section>

          <TicketQueue
            tickets={tickets}
            visibleTickets={visibleTickets}
            loading={loading}
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            priority={priority}
            setPriority={setPriority}
            category={category}
            setCategory={setCategory}
            clearFilters={clearFilters}
          />
        </div>
      </main>
    </div>
  );
}
