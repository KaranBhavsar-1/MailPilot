
import {
  Archive,
  Check,
  Circle,
  Mail,
  Star,
} from "lucide-react";

const classificationStyles = {
  ASSISTANT: "bg-blue-100 text-blue-700",
  CLIENT: "bg-pink-100 text-pink-700",
  NO_REPLY: "bg-green-100 text-green-700",
  REVIEW: "bg-amber-100 text-amber-700",
};

const classificationLabels = {
  ASSISTANT: "Assistant",
  CLIENT: "Client",
  NO_REPLY: "No Reply",
  REVIEW: "Review",
};

const priorityStyles = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

const formatDate = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  const now = new Date();
  const isToday = value.toDateString() === now.toDateString();

  if (isToday) {
    return value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return value.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

const getSender = (participants) => {
  if (!participants?.length) return "Unknown sender";

  return participants[0];
};

export default function ThreadListItem({
  thread,
  selected,
  onSelect,
  onAction,
}) {
  const sender = getSender(thread.participants);

  return (
    <div
      onClick={() => onSelect?.(thread)}
      className={`group cursor-pointer border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50 ${
        selected ? "bg-purple-50" : "bg-white"
      } ${thread.isUnread ? "border-l-4 border-l-purple-500" : "border-l-4 border-l-transparent"}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {thread.isUnread ? (
            <Circle
              size={9}
              fill="currentColor"
              className="text-purple-600"
            />
          ) : (
            <Mail size={17} className="text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={`truncate text-sm ${
                thread.isUnread
                  ? "font-bold text-slate-900"
                  : "font-medium text-slate-700"
              }`}
            >
              {sender}
            </p>

            <span className="shrink-0 text-xs text-slate-400">
              {formatDate(thread.lastMessageAt)}
            </span>
          </div>

          <p
            className={`mt-1 truncate text-sm ${
              thread.isUnread
                ? "font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            {thread.subject || "(No subject)"}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {thread.snippet || "No message preview available."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                classificationStyles[thread.currentClassification] ||
                classificationStyles.REVIEW
              }`}
            >
              {classificationLabels[thread.currentClassification] ||
                "Review"}
            </span>

            {thread.manuallyOverridden && (
  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700">
    Manually changed
  </span>
)}

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                priorityStyles[thread.priority] ||
                priorityStyles.MEDIUM
              }`}
            >
              {thread.priority || "MEDIUM"}
            </span>

            {thread.isImportant && (
              <span className="text-amber-500" title="Important">
                <Star size={14} fill="currentColor" />
              </span>
            )}
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            title={thread.isImportant ? "Remove important" : "Mark important"}
            onClick={() =>
              onAction?.(thread._id, {
                isImportant: !thread.isImportant,
              })
            }
            className={`rounded-lg p-2 hover:bg-amber-50 ${
              thread.isImportant ? "text-amber-500" : "text-slate-400"
            }`}
          >
            <Star
              size={16}
              fill={thread.isImportant ? "currentColor" : "none"}
            />
          </button>

          <button
            type="button"
            title={thread.isUnread ? "Mark as read" : "Mark as unread"}
            onClick={() =>
              onAction?.(thread._id, {
                isUnread: !thread.isUnread,
              })
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
          >
            {thread.isUnread ? <Check size={16} /> : <Mail size={16} />}
          </button>

          <button
            type="button"
            title="Archive"
            onClick={() =>
              onAction?.(thread._id, {
                isArchived: true,
              })
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Archive size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
