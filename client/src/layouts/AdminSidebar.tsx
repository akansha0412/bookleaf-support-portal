import type { Auth } from '../features/auth/auth.types';

type AdminSidebarProps = {
  auth: Auth;
  ticketCount: number;
  onLogout: () => void;
};

export function AdminSidebar({ auth, ticketCount, onLogout }: AdminSidebarProps) {
  return (
  <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-white">
            b.
          </div>
          <div>
            <p className="font-bold tracking-tight">BookLeaf</p>
            <p className="text-xs text-slate-500">Support workspace</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400">
            WORKSPACE
          </p>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800">
            <span>▤</span> Ticket queue
            <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs">
              {ticketCount}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500">
            <span>◷</span> Activity
            <span className="ml-auto text-xs">Soon</span>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {auth.user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{auth.user.name}</p>
              <p className="truncate text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ↪ Sign out
          </button>
        </div>
      </aside>
  );
}
