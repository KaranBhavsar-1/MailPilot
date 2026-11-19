
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function ThreadFilters({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  unread,
  onUnreadChange,
  important,
  onImportantChange,
  onClear,
}) {
  const hasFilters =
    search || priority || unread !== "" || important !== "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-400"
          >
            <option value="">All priorities</option>
            <option value="HIGH">High priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="LOW">Low priority</option>
          </select>

          <select
            value={unread}
            onChange={(event) => onUnreadChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-400"
          >
            <option value="">All messages</option>
            <option value="true">Unread</option>
            <option value="false">Read</option>
          </select>

          <select
            value={important}
            onChange={(event) => onImportantChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-400"
          >
            <option value="">All conversations</option>
            <option value="true">Important</option>
            <option value="false">Not important</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              <X size={15} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <SlidersHorizontal size={14} />
        Search and filters update the conversation list.
      </div>
    </div>
  );
}
