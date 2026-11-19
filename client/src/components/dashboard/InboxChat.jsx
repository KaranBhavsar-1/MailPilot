import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bot,
  Send,
  Sparkles,
  User,
  MessageCircle,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { chatWithInbox } from "../../api/ai.api";

const suggestedQuestions = [
  "Which conversations require the client's attention?",
  "Which conversations are waiting for a response?",
  "Summarize the most important conversations.",
  "Are there any conversations requiring urgent attention?",
];

export default function InboxChat() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    if (trimmedQuestion.length > 1000) {
      toast.error("Your question cannot exceed 1000 characters.");
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await chatWithInbox(trimmedQuestion);
      const data = response.data;

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer || "I couldn't find an answer to that question.",
          relevantThreads: data.relevantThreads || [],
        },
      ]);
    } catch (error) {
      console.error("Inbox chat error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "I couldn't process your question. Please try again.";

      toast.error(errorMessage);

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage,
          relevantThreads: [],
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestion) => {
    if (loading) return;
    setQuestion(suggestion);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-600 p-2.5 text-white">
            <Sparkles size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Ask MailPilot AI
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Ask questions about your client's inbox
            </p>
          </div>
        </div>

        <span className="hidden items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Read-only assistant
        </span>
      </div>

      {/* Chat area */}
      <div className="max-h-[480px] min-h-[230px] space-y-5 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="py-5">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="rounded-2xl bg-purple-50 p-4 text-purple-600">
                <MessageCircle size={28} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                How can I help you today?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ask me about important conversations, pending client
                decisions, waiting replies, or other inbox activity.
              </p>
            </div>

            <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestedQuestion(suggestion)}
                  className="rounded-xl border border-slate-200 p-3 text-left text-sm text-slate-600 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isUser
                      ? "bg-slate-100 text-slate-600"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {isUser ? <User size={17} /> : <Bot size={18} />}
                </div>

                <div
                  className={`min-w-0 max-w-[85%] ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  <p
                    className={`mb-1 text-xs font-medium ${
                      isUser
                        ? "text-slate-500"
                        : "text-purple-700"
                    }`}
                  >
                    {isUser ? "You" : "MailPilot AI"}
                  </p>

                  <div
                    className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
                      isUser
                        ? "rounded-tr-sm bg-purple-600 text-white"
                        : message.isError
                        ? "rounded-tl-sm border border-red-200 bg-red-50 text-red-700"
                        : "rounded-tl-sm bg-slate-100 text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {!isUser &&
                    message.relevantThreads?.length > 0 && (
                      <div className="mt-3 space-y-2 text-left">
                        <p className="text-xs font-semibold text-slate-500">
                          Relevant conversations
                        </p>

                        {message.relevantThreads.map((thread) => (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() =>
                              navigate(`/app/threads/${thread.id}`)
                            }
                            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-purple-300 hover:bg-purple-50"
                          >
                            <span className="min-w-0 truncate text-sm font-medium text-slate-700">
                              {thread.subject || "Untitled conversation"}
                            </span>

                            <ArrowRight
                              size={16}
                              className="shrink-0 text-purple-600"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Bot size={18} />
            </div>

            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-500">
              <LoaderCircle size={15} className="animate-spin" />
              Analyzing your inbox...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-100 bg-slate-50 p-4"
      >
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 transition focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={1000}
            disabled={loading}
            placeholder="Ask something about your inbox..."
            className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            aria-label="Send question"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-slate-400">
          AI responses are based on the inbox context available to MailPilot.
          Always verify important decisions.
        </p>
      </form>
    </section>
  );
}