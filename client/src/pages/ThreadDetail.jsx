import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Activity, AlertCircle,   Archive,ArrowLeft,CheckCircle2,Clock,Star,} from "lucide-react";
import toast from "react-hot-toast";

// import { getThreadById, updateThread } from "../api/threads.api";
import { getThreadById,updateThread, updateThreadClassification, resetThreadClassification,analyzeThread, } from "../api/threads.api";

import ThreadConversation from "../components/thread/ThreadConversation";
import AIAnalysisPanel from "../components/thread/AIAnalysisPanel";
import ClassificationSelect from "../components/thread/ClassificationSelect";

import ReplyComposer from "../components/thread/ReplyComposer";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Something went wrong. Please try again.";

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

const activityLabels = {
  CLASSIFICATION_CHANGED: "Classification changed",
  MARKED_IMPORTANT: "Marked as important",
  UNMARKED_IMPORTANT: "Removed important mark",
  ARCHIVED: "Archived conversation",
  UNARCHIVED: "Unarchived conversation",
  MARKED_UNREAD: "Marked as unread",
  MARKED_READ: "Marked as read",
  MARKED_DONE: "Marked as done",
  REOPENED: "Reopened conversation",
  MARKED_WAITING_FOR_RESPONSE: "Marked as waiting for response",
  MARKED_NOT_WAITING: "Removed waiting status",
  CLIENT_HANDLED: "Client handled",
  DELEGATED_TO_ASSISTANT: "Delegated to assistant",
  DRAFT_APPROVED: "Draft approved",

  AI_ANALYSIS_COMPLETED: "AI analysis completed",

  CLASSIFICATION_RESET_TO_AI: "Reset to AI recommendation",
  DRAFT_SIMULATED_SENT: "Simulated reply added",
};

function ActivityTimeline({ activities = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Activity size={19} className="text-purple-600" />

        <h2 className="font-semibold text-slate-900">
          Activity timeline
        </h2>
      </div>

      {activities.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No human actions have been recorded for this conversation yet.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {activities.map((item) => {
            const label =
              activityLabels[item.action] ||
              (item.action || "Activity recorded")
                .replaceAll("_", " ")
                .toLowerCase();

            return (
              <div key={item._id} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <CheckCircle2 size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold capitalize text-slate-800">
                    {label}
                  </p>
{[
  "CLASSIFICATION_CHANGED",
  "CLASSIFICATION_RESET_TO_AI",
].includes(item.action) && (
  <p className="mt-1 text-xs text-slate-600">
    {item.previousValue || "Unknown"} →{" "}
    {item.newValue || "Unknown"}
  </p>
)}

                  {item.note && (
                    <p className="mt-1 text-sm text-slate-600">
                      {item.note}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{formatDate(item.createdAt)}</span>

                    {item.actorRole && (
                      <span>
                        · {item.actorRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const [updating, setUpdating] = useState(false);
  // const [classificationReason, setClassificationReason] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [classificationReason, setClassificationReason] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getThreadById(id);
      setDetail(response.data);
    } catch (err) {
      console.error("Thread detail error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleBack = () => {
    // Prefer navigation state, but also support refreshing the detail page.
    const returnTo =
      location.state?.from || searchParams.get("returnTo");

    // Only navigate to an internal assistant page.
    if (
      returnTo &&
      returnTo.startsWith("/app/") &&
      !returnTo.startsWith("/app/threads/")
    ) {
      navigate(returnTo);
    } else {
      navigate("/app/inbox");
    }
  };

  const handleUpdate = async (changes, successMessage) => {
    try {
      setUpdating(true);

      await updateThread(id, changes);
      await fetchDetail();

      toast.success(successMessage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

const handleClassificationChange = async (newClassification) => {
  if (!thread || newClassification === thread.currentClassification) {
    return;
  }

  const oldClassification = thread.currentClassification;

  // Confirm changes that affect client responsibility
  // or suppress the need for a reply.
  const requiresConfirmation =
    ["CLIENT", "NO_REPLY"].includes(oldClassification) ||
    ["CLIENT", "NO_REPLY"].includes(newClassification);

  if (requiresConfirmation) {
    const confirmed = window.confirm(
      `You are changing the classification from ${oldClassification} to ${newClassification}.\n\nThis can change how this conversation is handled. Do you want to continue?`
    );

    if (!confirmed) return;
  }

  try {
    setUpdating(true);

    await updateThreadClassification(id, {
      classification: newClassification,
      reason: classificationReason,
    });

    setClassificationReason("");

    await fetchDetail();

    toast.success("Classification manually updated.");
  } catch (err) {
    toast.error(getErrorMessage(err));
  } finally {
    setUpdating(false);
  }
};

const handleResetClassification = async () => {
  const confirmed = window.confirm(
    "Reset this classification to the latest AI recommendation?\n\nYour manual correction and its reason will be cleared from the thread's override fields. The activity timeline will retain the reset history."
  );

  if (!confirmed) return;

  try {
    setUpdating(true);

    await resetThreadClassification(id);

    setClassificationReason("");

    await fetchDetail();

    toast.success("Classification reset to AI recommendation.");
  } catch (err) {
    toast.error(getErrorMessage(err));
  } finally {
    setUpdating(false);
  }
};

const handleAnalyzeThread = async () => {
  if (analyzing || updating) return;

  try {
    setAnalyzing(true);

    const response = await analyzeThread(id);

    await fetchDetail();

    const status = response.data?.result?.status;

    if (status === "SUCCESS") {
      toast.success("AI analysis completed successfully.");
    } else if (status === "FALLBACK") {
      toast("Fallback analysis completed. Manual review is required.");
    } else {
      toast.error(
        "AI analysis could not be completed. Manual review is required."
      );
    }
  } catch (err) {
    console.error("AI analysis error:", err);
    toast.error(getErrorMessage(err));
  } finally {
    setAnalyzing(false);
  }
};


  const thread = detail?.thread;
  const messages = detail?.messages || [];
  const analysis = detail?.latestAnalysis;
  const activities = detail?.activities || [];

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto text-red-500" size={30} />

        <h2 className="mt-3 font-semibold text-slate-900">
          Unable to load conversation
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error || "Conversation not found."}
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Back to inbox
          </button>

          <button
            type="button"
            onClick={fetchDetail}
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top navigation */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-700"
        >
          <ArrowLeft size={17} />
          Back to inbox
        </button>
      </div>

      {/* Conversation heading */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
              Conversation details
            </p>

            <h1 className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl">
              {thread.subject || "(No subject)"}
            </h1>

            {thread.manuallyOverridden && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                <CheckCircle2 size={13} />
                Manually changed
              </span>
            )}

            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>
                <span className="font-medium text-slate-700">
                  Participants:
                </span>{" "}
                {thread.participants?.length
                  ? thread.participants.join(", ")
                  : "No participants listed"}
              </p>

              <p>
                <span className="font-medium text-slate-700">
                  Last message:
                </span>{" "}
                {formatDate(thread.lastMessageAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                handleUpdate(
                  { isImportant: !thread.isImportant },
                  thread.isImportant
                    ? "Removed important mark."
                    : "Marked as important.",
                )
              }
              title="Toggle important"
              className={`rounded-xl border p-3 transition ${
                thread.isImportant
                  ? "border-amber-200 bg-amber-50 text-amber-600"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Star
                size={18}
                fill={thread.isImportant ? "currentColor" : "none"}
              />
            </button>

            <button
              type="button"
              disabled={updating}
              onClick={() =>
                handleUpdate(
                  { isArchived: !thread.isArchived },
                  thread.isArchived
                    ? "Conversation unarchived."
                    : "Conversation archived.",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Archive size={17} />
              {thread.isArchived ? "Unarchive" : "Archive"}
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* <div className="min-w-0 space-y-6 xl:col-span-2">
          <ThreadConversation messages={messages} />

          <ActivityTimeline activities={activities} />
        </div> */}

<div className="min-w-0 space-y-6 xl:col-span-2">
  <ThreadConversation messages={messages} />

  <ReplyComposer
    threadId={id}
    onApproved={fetchDetail}
  />

  <ActivityTimeline activities={activities} />
</div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900">Classification</h2>

              {thread.manuallyOverridden && (
                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700">
                  Manually changed
                </span>
              )}
            </div>

            <ClassificationSelect
              value={thread.currentClassification}
              disabled={updating}
              reason={classificationReason}
              onReasonChange={setClassificationReason}
              onChange={handleClassificationChange}
            />

            {thread.manuallyOverridden && (
              <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/70 p-3">
                <p className="text-sm font-semibold text-purple-800">
                  Human correction is active
                </p>

                {thread.overrideReason && (
                  <p className="mt-1 text-xs leading-5 text-purple-700">
                    Reason: {thread.overrideReason}
                  </p>
                )}

                {thread.overrideAt && (
                  <p className="mt-1 text-xs text-purple-600">
                    Changed on: {new Date(thread.overrideAt).toLocaleString()}
                  </p>
                )}

                <button
                  type="button"
                  disabled={updating}
                  onClick={handleResetClassification}
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset to AI recommendation
                </button>
              </div>
            )}

            {!thread.manuallyOverridden && (
              <p className="mt-3 text-xs text-slate-500">
                No manual correction has been made. The current classification
                follows the AI recommendation.
              </p>
            )}

            {updating && (
              <p className="mt-3 text-xs font-medium text-purple-600">
                Saving classification...
              </p>
            )}
          </section>

          <AIAnalysisPanel
            thread={thread}
            analysis={analysis}
            onAnalyze={handleAnalyzeThread}
            analyzing={analyzing}
          />
        </div>
      </div>
    </div>
  );
}