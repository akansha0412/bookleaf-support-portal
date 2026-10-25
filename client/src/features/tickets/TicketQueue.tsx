import type { Ticket } from "./tickets.types";
import { FilterSelect } from "../../components/FilterSelect";
import {
  categoryLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
} from "../../constants/tickets";
import { useState } from "react";
import TicketDetailPanel from "./TicketDetailPanel";
import { useAuth } from "../auth/useAuth";

type TicketQueueProps = {
  tickets: Ticket[];
  visibleTickets: Ticket[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  clearFilters: () => void;
};

export function TicketQueue({
  visibleTickets,
  loading,
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  category,
  setCategory,
  clearFilters,
}: TicketQueueProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { auth } = useAuth();
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="font-bold">All tickets</h3>
            <p className="mt-1 text-xs text-slate-500">
              Review requests and identify the next action.
            </p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket, author, or book..."
              aria-label="Search tickets"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="All statuses"
            value={status}
            onChange={setStatus}
            options={[
              ["OPEN", "Open"],
              ["IN_PROGRESS", "In progress"],
              ["RESOLVED", "Resolved"],
              ["CLOSED", "Closed"],
            ]}
          />
          <FilterSelect
            label="All priorities"
            value={priority}
            onChange={setPriority}
            options={[
              ["CRITICAL", "Critical"],
              ["HIGH", "High"],
              ["MEDIUM", "Medium"],
              ["LOW", "Low"],
            ]}
          />
          <FilterSelect
            label="All categories"
            value={category}
            onChange={setCategory}
            options={Object.entries(categoryLabels)}
          />
          {(status || priority || category || search) && (
            <button
              onClick={clearFilters}
              className="px-2 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-xs text-slate-500">
            {visibleTickets.length} result
            {visibleTickets.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : visibleTickets.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">
            ✓
          </div>
          <h4 className="mt-4 font-semibold">No tickets found</h4>
          <p className="mt-1 text-sm text-slate-500">
            Try changing your filters or search term.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Author / book</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned to</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="cursor-pointer transition hover:bg-emerald-50/50"
                >
                  <td className="max-w-[300px] px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          ticket.isUrgent
                            ? "bg-red-500"
                            : ticket.isOverdue
                              ? "bg-amber-500"
                              : "bg-slate-300"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          #{ticket.id.slice(-8)}
                        </p>
                        {ticket.isOverdue && (
                          <span className="mt-2 inline-flex rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            OVERDUE · 48H+
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {ticket.author.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.book?.title ?? "General inquiry"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600">
                      {categoryLabels[ticket.category] ?? ticket.category}
                    </span>
                    {ticket.aiCategory &&
                      ticket.aiCategory !== ticket.category && (
                        <p className="mt-1 text-[10px] text-violet-600">
                          AI:{" "}
                          {categoryLabels[ticket.aiCategory] ??
                            ticket.aiCategory}
                        </p>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        priorityStyles[ticket.priority]
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    {ticket.aiPriority &&
                      ticket.aiPriority !== ticket.priority && (
                        <p className="mt-1 text-[10px] text-violet-600">
                          AI: {ticket.aiPriority}
                        </p>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[ticket.status]
                      }`}
                    >
                      {statusLabels[ticket.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {ticket.assignedAdmin?.name ?? "Unassigned"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
        <span>BookLeaf Author Support</span>
        <span>Ticket data is loaded from your backend API.</span>
      </div>
      {selectedTicket && auth !== null && (
        <TicketDetailPanel
          key={selectedTicket.id}
          ticket={selectedTicket}
          token={auth.token}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => {}}
        />
      )}
    </section>
  );
}
