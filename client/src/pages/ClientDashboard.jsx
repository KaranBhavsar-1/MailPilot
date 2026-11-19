// import { useAuth } from "../context/AuthContext";

// import PageHeader from "../components/common/PageHeader";
// import EmptyState from "../components/common/EmptyState";


// const ClientDashboard = () => {
//   const { user, logout } = useAuth();

//   return (
//     <div className="min-h-screen p-8">
//       <h1 className="text-3xl font-bold">
//         Welcome, {user?.name}
//       </h1>

//       <p className="mt-2 text-gray-600">
//         Client Dashboard
//       </p>

//       <button
//         onClick={logout}
//         className="mt-6 rounded bg-red-600 px-5 py-2 text-white"
//       >
//         Logout
//       </button>
//    <>
//       <PageHeader
//         title="Your Inbox"
//         subtitle="Here are the emails that need your attention."
//       />

//       <EmptyState
//         title="You're all caught up!"
//         description="Emails requiring your attention will appear here."
//       />
//     </>

//     </div>
//   );
// };

// export default ClientDashboard;


import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import {
  getClientThreads,
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

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getClientThreads();

      setThreads(response.data.items || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load your inbox."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleAction = async (threadId, action) => {
    try {
      setActionId(threadId);

      if (action === "handled") {
        await handleClientThread(threadId);
        toast.success("Conversation marked as handled.");
      } else {
        await handoffClientThread(threadId);
        toast.success("Conversation delegated to your assistant.");
      }

      await fetchThreads();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update conversation."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here are the emails that need your attention.
          </p>
        </div>

        <button
          onClick={fetchThreads}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Mail size={21} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Pending conversations</p>
            <p className="text-2xl font-bold text-gray-900">
              {threads.length}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Needs your attention
        </span>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading your conversations...
        </div>
      ) : threads.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle size={28} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            You're all caught up!
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Emails requiring your attention will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div
              key={thread._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900">
                      {thread.subject}
                    </h2>

                    {thread.priority === "HIGH" && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                        High priority
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <UserRound size={14} />
                      {thread.latestMessage?.senderName || "Unknown sender"}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {formatDate(
                        thread.latestMessage?.sentAt || thread.lastMessageAt
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/client/threads/${thread._id}`)}
                  className="inline-flex h-fit items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View conversation
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Summary
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  {thread.clientSummary ||
                    thread.summary ||
                    thread.snippet ||
                    "No summary available."}
                </p>
              </div>

              {thread.reason && (
                <div className="mt-3 flex gap-2 text-sm text-gray-600">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />

                  <p>
                    <span className="font-medium">Why this needs you: </span>
                    {thread.reason}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  disabled={actionId === thread._id}
                  onClick={() => handleAction(thread._id, "handoff")}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Delegate to assistant
                </button>

                <button
                  disabled={actionId === thread._id}
                  onClick={() => handleAction(thread._id, "handled")}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionId === thread._id ? "Updating..." : "Mark as handled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
