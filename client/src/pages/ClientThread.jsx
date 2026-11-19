
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  UserRound,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getClientThreadById,
  handleClientThread,
  handoffClientThread,
} from "../api/client.api";

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ClientThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getClientThreadById(id);
      const data = response.data;

      setThread(data.thread);
      setMessages(data.messages || []);
      setActivities(data.activities || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load this conversation."
      );
      navigate("/client", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleAction = async (action) => {
    try {
      setActionLoading(true);

      if (action === "handled") {
        await handleClientThread(id);
        toast.success("Conversation marked as handled.");
      } else {
        await handoffClientThread(id);
        toast.success("Conversation delegated to your assistant.");
      }

      navigate("/client");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update this conversation."
      );

      // Refresh in case the conversation was updated elsewhere.
      await fetchThread();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-500">
        Loading conversation...
      </div>
    );
  }

  if (!thread) return null;

  const isPending =
    thread.currentClassification === "CLIENT" &&
    thread.clientStatus === "PENDING" &&
    !thread.isArchived &&
    !thread.isDone;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/client")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={17} />
        Back to your inbox
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {thread.subject}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {thread.participants?.join(", ") || "Conversation participants"}
            </p>
          </div>

          {thread.priority && (
            <span
              className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-medium ${
                thread.priority === "HIGH"
                  ? "bg-red-50 text-red-700"
                  : thread.priority === "MEDIUM"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {thread.priority} priority
            </span>
          )}
        </div>

        <div className="mt-5 rounded-lg bg-blue-50 p-4">
          <h2 className="text-sm font-semibold text-blue-900">
            Summary for you
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-900">
            {thread.clientSummary ||
              thread.summary ||
              thread.snippet ||
              "No summary available."}
          </p>
        </div>

        {(thread.reason || thread.suggestedAction) && (
          <div className="mt-4 space-y-3">
            {thread.reason && (
              <div className="flex gap-2 text-sm text-gray-700">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <p>
                  <span className="font-semibold">
                    Why your attention is needed:{" "}
                  </span>
                  {thread.reason}
                </p>
              </div>
            )}

            {thread.suggestedAction && (
              <div className="flex gap-2 text-sm text-gray-700">
                <CheckCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-blue-500"
                />
                <p>
                  <span className="font-semibold">
                    Suggested action:{" "}
                  </span>
                  {thread.suggestedAction}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Conversation
        </h2>

        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No messages found.
          </p>
        ) : (
          <div className="space-y-5">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.direction === "OUTBOUND"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl rounded-xl p-4 ${
                    message.direction === "OUTBOUND"
                      ? "bg-blue-50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <UserRound size={14} />
                    <span className="font-semibold text-gray-700">
                      {message.senderName}
                    </span>
                    <span>{message.senderEmail}</span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                    {message.body}
                  </p>

                  <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {formatDate(message.sentAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isPending ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">
            What would you like to do?
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            You can handle this conversation yourself or send it back to your assistant.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              disabled={actionLoading}
              onClick={() => handleAction("handoff")}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Delegate to assistant
            </button>

            <button
              disabled={actionLoading}
              onClick={() => handleAction("handled")}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? "Updating..." : "Mark as handled"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">
            This conversation is no longer waiting for your response.
          </p>
        </div>
      )}

      {activities.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Activity history
          </h2>

          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity._id} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm font-medium text-gray-800">
                  {activity.action.replaceAll("_", " ")}
                </p>

                {activity.note && (
                  <p className="mt-1 text-sm text-gray-500">
                    {activity.note}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={fetchThread}
        disabled={loading}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <RefreshCw size={14} />
        Refresh conversation
      </button>
    </div>
  );
};

export default ClientThread;
