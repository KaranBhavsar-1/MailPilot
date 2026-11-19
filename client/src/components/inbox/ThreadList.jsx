
import { Inbox, RefreshCw } from "lucide-react";
import ThreadListItem from "./ThreadListItem";

function ThreadSkeleton() {
  return (
    <div className="animate-pulse border-b border-slate-100 p-4">
      <div className="h-4 w-36 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-full rounded bg-slate-100" />
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-200" />
        <div className="h-5 w-16 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function ThreadList({
  threads = [],
  loading = false,
  error = "",
  selectedThreadId,
  onSelect,
  onAction,
  onRetry,
  emptyTitle = "No conversations found",
  emptyDescription = "There are no conversations in this section yet.",
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {Array.from({ length: 5 }).map((_, index) => (
          <ThreadSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-semibold text-red-700">
          Unable to load conversations
        </p>

        <p className="mt-2 text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  if (!threads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Inbox size={22} className="text-slate-500" />
        </div>

        <h3 className="mt-4 font-semibold text-slate-800">
          {emptyTitle}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {threads.map((thread) => (
        <ThreadListItem
          key={thread._id}
          thread={thread}
          selected={selectedThreadId === thread._id}
          onSelect={onSelect}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
