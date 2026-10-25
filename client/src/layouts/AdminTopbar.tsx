import type { Auth } from '../features/auth/auth.types';

type AdminTopbarProps = {
  auth: Auth;
  onRefresh: () => void;
  onLogout: () => void;
};

export function AdminTopbar({ auth, onRefresh, onLogout }: AdminTopbarProps) {
  return (
        <header className="sticky top-0 z-10 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-medium text-slate-500">
              BookLeaf / Support
            </p>
            <h1 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
              Ticket management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{auth.user.name}</p>
              <p className="text-xs text-slate-500">Support administrator</p>
            </div>
            <button
              onClick={onRefresh}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
            >
              ↻ <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 lg:hidden"
            >
              Sign out
            </button>
          </div>
        </header>
  );
}
