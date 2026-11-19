import { Clock, Mail } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Date unavailable";
  }

  return value.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function MessageBubble({ message }) {
  const isOutgoing = message.direction === "OUTBOUND";

  return (
    <div
      className={`flex ${
        isOutgoing ? "justify-end" : "justify-start"
      }`}
    >
      <article
        className={`w-full max-w-2xl rounded-2xl border p-4 shadow-sm ${
          isOutgoing
            ? "border-purple-200 bg-purple-50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {message.senderName || "Unknown sender"}
            </p>

            <p className="break-all text-xs text-slate-500">
              {message.senderEmail || ""}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isOutgoing
                ? "bg-purple-100 text-purple-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isOutgoing ? "Sent" : "Received"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Clock size={13} />
          {formatDate(message.sentAt)}
        </div>

        {message.recipients?.length > 0 && (
          <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
            <Mail size={13} className="mt-0.5 shrink-0" />
            <span className="break-all">
              To: {message.recipients.join(", ")}
            </span>
          </div>
        )}

        <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {message.body || "No message content available."}
        </div>

        {message.isSimulated && (
          <p className="mt-3 text-right text-xs text-slate-400">
            Simulated email
          </p>
        )}
      </article>
    </div>
  );
}