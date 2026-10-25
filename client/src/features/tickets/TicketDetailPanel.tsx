import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type TicketCategory =
  | "ROYALTY_PAYMENTS"
  | "ISBN_METADATA"
  | "PRINTING_QUALITY"
  | "DISTRIBUTION_AVAILABILITY"
  | "BOOK_STATUS_PRODUCTION"
  | "GENERAL_INQUIRY";

type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  aiCategory?: string | null;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  aiPriority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string };
  book?: { id: string; title: string; isbn?: string | null } | null;
  assignedAdmin?: { id: string; name: string; email: string } | null;
};

type InternalNote = {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
};

type NotesResponse = {
  success: boolean;
  data: InternalNote[];
};

type TicketDetailPanelProps = {
  ticket: Ticket;
  token: string;
  onClose: () => void;
  onUpdated: () => void;
};

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const categoryLabels: Record<string, string> = {
  ROYALTY_PAYMENTS: "Royalty & Payments",
  ISBN_METADATA: "ISBN & Metadata Issues",
  PRINTING_QUALITY: "Printing & Quality",
  DISTRIBUTION_AVAILABILITY: "Distribution & Availability",
  BOOK_STATUS_PRODUCTION: "Book Status & Production Updates",
  GENERAL_INQUIRY: "General Inquiry",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function TicketDetailPanel({
  ticket,
  token,
  onClose,
  onUpdated,
}: TicketDetailPanelProps) {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [noteMessage, setNoteMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [assigned, setAssigned] = useState(Boolean(ticket.assignedAdmin));
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [category, setCategory] = useState<TicketCategory>(
    ticket.category as TicketCategory,
  );

  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);

//   useEffect(() => {
//     setCategory(ticket.category as TicketCategory);
//     setPriority(ticket.priority);
//   }, [ticket.id, ticket.category, ticket.priority]);

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setLoadingNotes(true);

      try {
        const result = await apiRequest<NotesResponse>(
          `/api/admin/tickets/${ticket.id}/notes`,
          {},
          token,
        );
        if (!cancelled) {
          setNotes(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load internal notes.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingNotes(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [ticket.id, token]);

  useEffect(() => {}, [notes]);

  async function handleGenerateDraft() {
    setError("");
    setGeneratingDraft(true);

    try {
      const result = await apiRequest<{
        success: boolean;
        data: { draft: string };
      }>(
        `/api/admin/tickets/${ticket.id}/draft-reply`,
        { method: "POST" },
        token,
      );

      setReplyMessage(result.data.draft);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate an AI reply draft.",
      );
    } finally {
      setGeneratingDraft(false);
    }
  }

  async function runAction(action: () => Promise<void>, message: string) {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await action();
      setSuccess(message);
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The action could not be completed.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveClassification() {
    setError('');
    setSuccess('');
    setSuccessMessage('');
    setSaving(true);
  
    try {
      await apiRequest(
        `/api/admin/tickets/${ticket.id}/classification`,
        {
          method: 'PATCH',
          body: JSON.stringify({ category, priority }),
        },
        token,
      );
  
      setSuccess('Ticket classification updated successfully.');
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update ticket classification.',
      );
    } finally {
      setSaving(false);
    }
  }

  function assignToMe() {
    return runAction(async () => {
      await apiRequest(
        `/api/admin/tickets/${ticket.id}/assign-self`,
        { method: "PATCH" },
        token,
      );
      setAssigned(true);
    }, "Ticket assigned to you.");
  }

  function saveStatus() {
    return runAction(async () => {
      await apiRequest(
        `/api/admin/tickets/${ticket.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        token,
      );
    }, "Ticket status updated.");
  }

  function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = noteMessage.trim();
    if (!message) return;

    return runAction(async () => {
      await apiRequest(
        `/api/admin/tickets/${ticket.id}/notes`,
        {
          method: "POST",
          body: JSON.stringify({ message }),
        },
        token,
      );

      const result = await apiRequest<NotesResponse>(
        `/api/admin/tickets/${ticket.id}/notes`,
        {},
        token,
      );

      setNotes(result.data);
      setNoteMessage("");
    }, "Internal note added. It is not visible to the author.");
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // const message = replyMessage.trim();
    // if (!message) return;

    // return runAction(async () => {
    //   await apiRequest(
    //     `/api/admin/tickets/${ticket.id}/responses`,
    //     {
    //       method: "POST",
    //       body: JSON.stringify({ message }),
    //     },
    //     token,
    //   );

    //   setReplyMessage("");
    // }, "Your response was sent to the author.");
    if (!replyMessage.trim()) {
      setError("Please enter a reply before sending.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setSaving(true);

    try {
      await apiRequest(
        `/api/admin/tickets/${ticket.id}/responses`,
        {
          method: "POST",
          body: JSON.stringify({ message: replyMessage.trim() }),
        },
        token,
      );

      setReplyMessage("");
      setSuccessMessage("Reply sent successfully.");

      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send the reply.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <section
        aria-labelledby="ticket-detail-title"
        className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="min-w-0 pr-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Ticket details
            </p>
            <h2
              id="ticket-detail-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              {ticket.subject}
            </h2>
            <p className="mt-1 break-all text-xs text-slate-500">
              ID: {ticket.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket details"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </header>

        <div className="space-y-6 p-6">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {success}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">Ticket information</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Author</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {ticket.author.name}
                </dd>
                <dd className="break-all text-sm text-slate-500">
                  {ticket.author.email}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Linked book</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {ticket.book?.title ?? "General / account-level request"}
                </dd>
                {ticket.book?.isbn && (
                  <dd className="text-sm text-slate-500">
                    ISBN: {ticket.book.isbn}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-xs text-slate-500">Category</dt>
                <dd className="mt-1 text-sm text-slate-900">
                {categoryLabels[category] ?? category}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Priority</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                {priority}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Created</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(ticket.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Assigned admin</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {ticket.assignedAdmin?.name ?? "Unassigned"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Author's message
              </h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {ticket.description}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <h3 className="font-semibold text-slate-900">AI assessment</h3>
            <p className="mt-3 text-sm text-slate-700">
              <span className="font-medium">Suggested category: </span>
              {ticket.aiCategory
                ? (categoryLabels[ticket.aiCategory] ?? ticket.aiCategory)
                : "Not available"}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-medium">Suggested priority: </span>
              {ticket.aiPriority ?? "Not available"}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              AI suggestions should be reviewed by the support administrator.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">
              Review classification
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Review the AI suggestions and correct the category or priority if
              needed.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ticket-category"
                  className="mb-2 block text-xs font-medium text-slate-600"
                >
                  Category
                </label>

                <select
                  id="ticket-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as TicketCategory)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ticket-priority"
                  className="mb-2 block text-xs font-medium text-slate-600"
                >
                  Priority
                </label>

                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TicketPriority)
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => void saveClassification()}
                disabled={
                  saving ||
                  (category === ticket.category && priority === ticket.priority)
                }
                className="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save classification"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">Manage ticket</h3>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-40 flex-1">
                <label
                  htmlFor="ticket-status"
                  className="mb-2 block text-xs font-medium text-slate-600"
                >
                  Status
                </label>
                <select
                  id="ticket-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TicketStatus)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => void saveStatus()}
                disabled={saving || status === ticket.status}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save status
              </button>

              <button
                type="button"
                onClick={() => void assignToMe()}
                disabled={saving || assigned}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigned ? "Assigned" : "Assign to me"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <h3 className="font-semibold text-slate-900">Internal notes</h3>
            <p className="mt-1 text-xs text-slate-600">
              Private to administrators. Authors cannot see these notes.
            </p>

            <form onSubmit={addNote} className="mt-4 space-y-3">
              <textarea
                value={noteMessage}
                onChange={(event) => setNoteMessage(event.target.value)}
                rows={3}
                maxLength={5000}
                required
                placeholder="Add an internal note for the support team…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={saving || !noteMessage.trim()}
                className="rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
              >
                Add internal note
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {loadingNotes ? (
                <p className="text-sm text-slate-500">Loading notes…</p>
              ) : notes && notes.length === 0 ? (
                <p className="text-sm text-slate-500">No internal notes yet.</p>
              ) : (
                notes &&
                notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-lg border border-amber-200/70 bg-white p-3"
                  >
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {note.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(note.createdAt)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <h3 className="font-semibold text-slate-900">Reply to author</h3>
            <p className="mt-1 text-xs text-slate-600">
              This message is public and will be visible to the author.
            </p>

            <button
              type="button"
              onClick={() => void handleGenerateDraft()}
              disabled={generatingDraft || saving}
              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generatingDraft ? "Generating draft…" : "Generate AI Draft"}
            </button>

            <form onSubmit={sendReply} className="mt-4 space-y-3">
              {successMessage && (
                <p
                  role="status"
                  className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
                >
                  {successMessage}
                </p>
              )}
              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                rows={5}
                maxLength={10000}
                required
                placeholder="Write a helpful, professional response…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !replyMessage.trim()}
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send response
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
