import { Mail } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ThreadConversation({ messages = [] }) {
  // The API already sorts messages by sentAt ascending.
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Mail size={18} />
            Conversation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete email history, from oldest to newest.
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {messages.length} messages
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Mail className="mx-auto text-slate-400" size={28} />

          <p className="mt-3 font-medium text-slate-700">
            No messages available
          </p>

          <p className="mt-1 text-sm text-slate-500">
            This conversation does not have any message records yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
            />
          ))}
        </div>
      )}
    </section>
  );
}