
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Archive,ArrowRight,CalendarDays,Clock,Inbox,Mail,MessageCircle,RefreshCw,ShieldAlert,Star,UserRound,MailPlus,X,} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import ThreadList from "../components/inbox/ThreadList";
import InboxChat from "../components/dashboard/InboxChat";

import {
  getThreadStats,
  getThreads,
  updateThread,
  simulateIncomingEmail,
  getUpcomingDates,
} from "../api/threads.api";

const quickLinks = [
  {
    label: "All Inbox",
    description: "View all active conversations",
    path: "/app/inbox",
    icon: Inbox,
    color: "bg-purple-100 text-purple-700",
  },
  {
    label: "Assistant Action",
    description: "Emails you need to handle",
    path: "/app/inbox?segment=assistant",
    icon: UserRound,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Client Action",
    description: "Emails awaiting client attention",
    path: "/app/inbox?segment=client",
    icon: Mail,
    color: "bg-pink-100 text-pink-700",
  },
  {
    label: "Needs Review",
    description: "Conversations that need checking",
    path: "/app/inbox?segment=review",
    icon: ShieldAlert,
    color: "bg-amber-100 text-amber-700",
  },
  {
    label: "Waiting",
    description: "Conversations awaiting a response",
    path: "/app/inbox?segment=waiting",
    icon: Clock,
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Archived",
    description: "Previously archived conversations",
    path: "/app/inbox?segment=archived",
    icon: Archive,
    color: "bg-slate-100 text-slate-700",
  },
];

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="mt-4 h-9 w-16 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [threads, setThreads] = useState([]);
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("meeting");
  const [simulating, setSimulating] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // const [statsResponse, threadsResponse] = await Promise.all([
      //   getThreadStats(),
      //   getThreads({ segment: "all", page: 1, limit: 5 }),
      // ]);

const [
  statsResponse,
  threadsResponse,
  datesResponse,
] = await Promise.all([
  getThreadStats(),
  getThreads({ segment: "all", page: 1, limit: 5 }),
  getUpcomingDates(),
]);

      const statsData = statsResponse.data;
      const threadData = threadsResponse.data;

      setStats(statsData.stats || statsData);
      setThreads(threadData.items || []);
      setUpcomingDates(datesResponse.data.items || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Could not load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleThreadAction = async (id, changes) => {
    try {
      await updateThread(id, changes);

      toast.success("Conversation updated successfully.");

      fetchDashboard();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not update conversation."
      );
    }
  };

  const handleSimulateIncoming = async (event) => {
  event.preventDefault();

  setSimulating(true);

  try {
    const response = await simulateIncomingEmail({
      scenario: selectedScenario,
    });

    const data = response.data;

    setShowSimulationModal(false);

    if (data.analysisStatus === "SUCCESS") {
      toast.success("Incoming email received and analyzed!");
    } else {
      toast.success("Incoming email received. Needs Review.");
    }

    // Refresh dashboard stats and recent conversations.
    await fetchDashboard();
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
        "Could not simulate incoming email."
    );
  } finally {
    setSimulating(false);
  }
};

  const statCards = [
    {
      title: "Active Conversations",
      value: stats?.totalActive ?? 0,
      description: "All active conversations",
      icon: MessageCircle,
      color: "purple",
      path: "/app/inbox",
    },
    {
      title: "Unread",
      value: stats?.unread ?? 0,
      description: "Messages waiting to be read",
      icon: Mail,
      color: "blue",
      path: "/app/inbox?unread=true",
    },
    {
      title: "Assistant Action",
      value: stats?.assistantAction ?? 0,
      description: "Require your attention",
      icon: UserRound,
      color: "blue",
      path: "/app/inbox?segment=assistant",
    },
    {
      title: "Client Action",
      value: stats?.clientActionPending ?? 0,
      description: "Awaiting client attention",
      icon: Inbox,
      color: "pink",
      path: "/app/inbox?segment=client",
    },
    {
      title: "Needs Review",
      value: stats?.needsReview ?? 0,
      description: "Need manual review",
      icon: ShieldAlert,
      color: "amber",
      path: "/app/inbox?segment=review",
    },
    {
      title: "Waiting",
      value: stats?.waiting ?? 0,
      description: "Awaiting a response",
      icon: Clock,
      color: "green",
      path: "/app/inbox?segment=waiting",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-purple-600">
            YOUR WORKSPACE
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening with your client's inbox.
          </p>
        </div>

        {/* <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button> */}
      <div className="flex flex-wrap items-center gap-2">
  <button
    type="button"
    onClick={() => setShowSimulationModal(true)}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
  >
    <MailPlus size={16} />
    Simulate new email
  </button>

  <button
    type="button"
    onClick={fetchDashboard}
    disabled={loading}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
  >
    <RefreshCw
      size={16}
      className={loading ? "animate-spin" : ""}
    />
    Refresh
  </button>
</div>
      
      </div>

      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Inbox overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A quick look at your inbox activity.
          </p>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                {...card}
                onClick={() => navigate(card.path)}
              />
            ))}
          </div>
        )}
      </section>
      {/* AI Inbox Assistant */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            AI inbox assistant
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Get quick answers and find conversations using natural language.
          </p>
        </div>

        <InboxChat />
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Quick access
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Jump directly to an inbox section.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <button
                key={link.label}
                type="button"
                onClick={() => navigate(link.path)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-purple-200 hover:shadow-sm"
              >
                <div className={`rounded-xl p-3 ${link.color}`}>
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    {link.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {link.description}
                  </p>
                </div>

                <ArrowRight size={17} className="text-slate-400" />
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent conversations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest inbox activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/app/inbox")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            View all <ArrowRight size={15} />
          </button>
        </div>

        <ThreadList
          threads={threads}
          loading={loading}
          error={error}
          onRetry={fetchDashboard}
          onSelect={() => navigate("/app/inbox")}
          onAction={handleThreadAction}
          emptyTitle="Your inbox is empty"
          emptyDescription="Connect a demo email account and sync conversations to see them here."
        />
      </section>

      {/* <section>
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CalendarDays size={19} />
            Upcoming meetings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your upcoming schedule.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
              <CalendarDays size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Meeting extraction is not available yet
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                MailPilot does not currently extract meeting dates from emails.
                Upcoming meetings will appear here once that feature is implemented.
              </p>
            </div>
          </div>
        </div>
      </section> */}
<section>
  <div className="mb-4">
    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
      <CalendarDays size={19} />
      Upcoming meetings
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Dates and events extracted from your latest email analyses.
    </p>
  </div>

  {upcomingDates.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
          <CalendarDays size={22} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-800">
            No upcoming dates found
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            When AI identifies future dates in your emails, they will
            appear here.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      {upcomingDates.map((item, index) => {
        const eventDate = new Date(item.dateTime);

        let formattedDate = "Date unavailable";

        try {
          formattedDate = new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
            ...(item.timezone
              ? { timeZone: item.timezone }
              : {}),
          }).format(eventDate);
        } catch {
          formattedDate = eventDate.toLocaleString();
        }

        return (
          <button
            key={`${item.threadId}-${item.dateTime}-${index}`}
            type="button"
            onClick={() =>
              navigate(`/app/threads/${item.threadId}`)
            }
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-purple-200 hover:shadow-sm"
          >
            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
              <CalendarDays size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">
                {item.label || "Upcoming event"}
              </p>

              <p className="mt-1 truncate text-sm text-slate-500">
                {item.subject}
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-purple-700">
                <Clock size={13} />
                {formattedDate}
              </p>
            </div>

            <ArrowRight
              size={18}
              className="shrink-0 text-slate-400"
            />
          </button>
        );
      })}
    </div>
  )}
</section>


      {showSimulationModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Simulate incoming email
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose an example email to add to the inbox and analyze with AI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSimulationModal(false)}
          disabled={simulating}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <X size={19} />
        </button>
      </div>

      <form onSubmit={handleSimulateIncoming} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="emailScenario"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select an email scenario
          </label>

          <select
            id="emailScenario"
            value={selectedScenario}
            onChange={(event) =>
              setSelectedScenario(event.target.value)
            }
            disabled={simulating}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          >
            <option value="meeting">
              Meeting scheduling request
            </option>

            <option value="approval">
              Budget approval request
            </option>

            <option value="newsletter">
              Monthly newsletter
            </option>

            <option value="ambiguous">
              Ambiguous email
            </option>
          </select>
        </div>

        <div className="rounded-xl bg-purple-50 p-3">
          <p className="text-xs leading-5 text-purple-800">
            MailPilot will add a simulated inbound message to the
            connected demo inbox and run AI classification.
            No real email will be sent or received.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowSimulationModal(false)}
            disabled={simulating}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={simulating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {simulating ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MailPlus size={15} />
                Simulate email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
