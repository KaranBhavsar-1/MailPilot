// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   useLocation,
//   useNavigate,
//   useSearchParams,
// } from "react-router-dom";
// import {
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Mail,
//   RefreshCw,
//   Star,
//   UserRound,
// } from "lucide-react";
// import toast from "react-hot-toast";

// import ThreadFilters from "../components/inbox/ThreadFilters";
// import ThreadList from "../components/inbox/ThreadList";

// import {
//   getThreads,
//   getThreadById,
//   updateThread,
// } from "../api/threads.api";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import ThreadFilters from "../components/inbox/ThreadFilters";
import ThreadList from "../components/inbox/ThreadList";

import {
  getThreads,
  updateThread,
} from "../api/threads.api";

const segmentDetails = {
  all: {
    title: "All Inbox",
    description: "All active conversations from your client's inbox.",
  },
  assistant: {
    title: "Assistant Action",
    description: "Conversations that require your attention.",
  },
  client: {
    title: "Client Action",
    description: "Conversations waiting for your client's attention.",
  },
  "no-reply": {
    title: "No Reply Needed",
    description: "Conversations that do not require a response.",
  },
  review: {
    title: "Needs Review",
    description: "Conversations that need manual checking.",
  },
  important: {
    title: "Important",
    description: "Conversations marked as important.",
  },
  waiting: {
    title: "Waiting",
    description: "Conversations waiting for a response.",
  },
  archived: {
    title: "Archived",
    description: "Previously archived conversations.",
  },
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Something went wrong. Please try again.";

const getTime = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function Inbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const routeSegment = location.pathname.split("/").pop();

  const segment = useMemo(() => {
    if (location.pathname === "/app/inbox") {
      return searchParams.get("segment") || "all";
    }

    if (segmentDetails[routeSegment]) {
      return routeSegment;
    }

    return "all";
  }, [location.pathname, routeSegment, searchParams]);

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("search") || ""
  );

  const [priority, setPriority] = useState(
    searchParams.get("priority") || ""
  );
  const [unread, setUnread] = useState(
    searchParams.get("unread") || ""
  );
  const [important, setImportant] = useState(
    searchParams.get("important") || ""
  );

  const [page, setPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1)
  );

  // const [selectedThread, setSelectedThread] = useState(null);
  // const [detailLoading, setDetailLoading] = useState(false);
  // const [detailError, setDetailError] = useState("");

  // const selectedThreadId = searchParams.get("thread");



  const segmentInfo = segmentDetails[segment] || segmentDetails.all;

  // Keep the search debounce short so we don't call the API on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Keep filters in the URL so they survive refresh and conversation navigation.
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    if (priority) params.set("priority", priority);
    else params.delete("priority");

    if (unread !== "") params.set("unread", unread);
    else params.delete("unread");

    if (important !== "") params.set("important", important);
    else params.delete("important");

    if (page > 1) params.set("page", String(page));
    else params.delete("page");

    // setSearchParams(params, { replace: true });
    if (params.toString() !== searchParams.toString()) {
  setSearchParams(params, { replace: true });
}

  }, [
    debouncedSearch,
    priority,
    unread,
    important,
    page,
    setSearchParams,
  ]);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        segment,
        page,
        limit: 10,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (priority) params.priority = priority;
      if (unread !== "") params.unread = unread;
      if (important !== "") params.important = important;

      const response = await getThreads(params);
      const data = response.data;

      setThreads(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(Math.max(1, data.totalPages || 1));
    } catch (err) {
      console.error("Inbox fetch error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    segment,
    page,
    debouncedSearch,
    priority,
    unread,
    important,
  ]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleAction = async (id, changes) => {
    try {
      await updateThread(id, changes);

      toast.success("Conversation updated successfully.");

      await fetchThreads();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

//   const openThread = async (thread) => {
//     // Save the selected conversation in the URL without removing filters.
//     const params = new URLSearchParams(searchParams);
//     params.set("thread", thread._id);

//     setSearchParams(params);

//     setSelectedThread(null);
//     setDetailError("");
//     setDetailLoading(true);

//     try {
//       const response = await getThreadById(thread._id);
//       setSelectedThread(response.data);
//     } catch (err) {
//       console.error("Thread detail error:", err);
//       setDetailError(getErrorMessage(err));
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//     const openThread = (thread) => {
//   const params = new URLSearchParams(searchParams);
//   params.set("thread", thread._id);

//   setSearchParams(params);
//   setSelectedThread(null);
//   setDetailError("");
// };

const openThread = (thread) => {
  const returnTo = `${location.pathname}${location.search}`;

  navigate(
    `/app/threads/${thread._id}?returnTo=${encodeURIComponent(returnTo)}`,
    {
      state: {
        from: returnTo,
      },
    }
  );
};

  // const closeThread = () => {
  //   const params = new URLSearchParams(searchParams);
  //   params.delete("thread");

  //   setSearchParams(params);
  //   setSelectedThread(null);
  //   setDetailError("");
  // };

  // Restore the selected conversation if the page is refreshed.

  // useEffect(() => {
  //   if (!selectedThreadId) {
  //     setSelectedThread(null);
  //     return;
  //   }

  //   let active = true;

  //   const loadSelectedThread = async () => {
  //     setDetailLoading(true);
  //     setDetailError("");

  //     try {
  //       const response = await getThreadById(selectedThreadId);

  //       if (active) {
  //         setSelectedThread(response.data);
  //       }
  //     } catch (err) {
  //       if (active) {
  //         setDetailError(getErrorMessage(err));
  //       }
  //     } finally {
  //       if (active) {
  //         setDetailLoading(false);
  //       }
  //     }
  //   };

  //   loadSelectedThread();

  //   return () => {
  //     active = false;
  //   };
  // }, [selectedThreadId]);

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPriority("");
    setUnread("");
    setImportant("");
    setPage(1);
  };

  // const thread = selectedThread?.thread || selectedThread;
  // const messages = selectedThread?.messages || [];
  // const analysis = selectedThread?.analysis || selectedThread?.latestAnalysis;

  // const getSender = (participants) =>
  //   participants?.[0] || "Unknown sender";

  // return (
  //   <div className="space-y-6">
  //     <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
  //       <div>
  //         <p className="text-sm font-medium text-purple-600">
  //           MAILPILOT INBOX
  //         </p>

  //         <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
  //           {segmentInfo.title}
  //         </h1>

  //         <p className="mt-2 text-sm text-slate-500">
  //           {segmentInfo.description}
  //         </p>
  //       </div>

  //       <button
  //         type="button"
  //         onClick={fetchThreads}
  //         disabled={loading}
  //         className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
  //       >
  //         <RefreshCw
  //           size={16}
  //           className={loading ? "animate-spin" : ""}
  //         />
  //         Refresh
  //       </button>
  //     </div>

  //     <ThreadFilters
  //       search={searchInput}
  //       onSearchChange={setSearchInput}
  //       priority={priority}
  //       onPriorityChange={(value) => {
  //         setPriority(value);
  //         setPage(1);
  //       }}
  //       unread={unread}
  //       onUnreadChange={(value) => {
  //         setUnread(value);
  //         setPage(1);
  //       }}
  //       important={important}
  //       onImportantChange={(value) => {
  //         setImportant(value);
  //         setPage(1);
  //       }}
  //       onClear={clearFilters}
  //     />

  //     <div className="flex flex-wrap items-center justify-between gap-2">
  //       <p className="text-sm text-slate-500">
  //         {loading ? "Loading conversations..." : `${total} conversation(s) found`}
  //       </p>

  //       <p className="text-xs text-slate-400">
  //         Page {page} of {totalPages}
  //       </p>
  //     </div>

  //     <div className={selectedThreadId ? "grid grid-cols-1 gap-5 xl:grid-cols-2" : ""}>
  //       <div className="min-w-0">
  //         <ThreadList
  //           threads={threads}
  //           loading={loading}
  //           error={error}
  //           onRetry={fetchThreads}
  //           onSelect={openThread}
  //           onAction={handleAction}
  //           selectedThreadId={selectedThreadId}
  //           emptyTitle="No conversations found"
  //           emptyDescription="Try changing your search or filters, or check another inbox section."
  //         />

  //         {!loading && !error && totalPages > 1 && (
  //           <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
  //             <button
  //               type="button"
  //               disabled={page <= 1}
  //               onClick={() => setPage((current) => Math.max(1, current - 1))}
  //               className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
  //             >
  //               <ChevronLeft size={17} />
  //               Previous
  //             </button>

  //             <span className="text-sm text-slate-500">
  //               {page} / {totalPages}
  //             </span>

  //             <button
  //               type="button"
  //               disabled={page >= totalPages}
  //               onClick={() =>
  //                 setPage((current) => Math.min(totalPages, current + 1))
  //               }
  //               className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
  //             >
  //               Next
  //               <ChevronRight size={17} />
  //             </button>
  //           </div>
  //         )}
  //       </div>

  //       {selectedThreadId && (
  //         <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  //           <div className="flex items-center justify-between border-b border-slate-100 p-4">
  //             <button
  //               type="button"
  //               onClick={closeThread}
  //               className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-700"
  //             >
  //               <ArrowLeft size={17} />
  //               Back to inbox
  //             </button>

  //             {thread && (
  //               <button
  //                 type="button"
  //                 onClick={() =>
  //                   handleAction(thread._id, {
  //                     isImportant: !thread.isImportant,
  //                   })
  //                 }
  //                 className={`rounded-lg p-2 ${
  //                   thread.isImportant
  //                     ? "text-amber-500"
  //                     : "text-slate-400 hover:text-amber-500"
  //                 }`}
  //                 title="Toggle important"
  //               >
  //                 <Star
  //                   size={18}
  //                   fill={thread.isImportant ? "currentColor" : "none"}
  //                 />
  //               </button>
  //             )}
  //           </div>

  //           {detailLoading ? (
  //             <div className="animate-pulse space-y-4 p-5">
  //               <div className="h-5 w-3/4 rounded bg-slate-200" />
  //               <div className="h-4 w-1/2 rounded bg-slate-100" />
  //               <div className="h-24 rounded-xl bg-slate-100" />
  //             </div>
  //           ) : detailError ? (
  //             <div className="p-6 text-sm text-red-600">
  //               {detailError}
  //               <button
  //                 type="button"
  //                 onClick={() => {
  //                   const found = threads.find(
  //                     (item) => item._id === selectedThreadId
  //                   );

  //                   if (found) openThread(found);
  //                 }}
  //                 className="mt-3 block font-semibold text-purple-600"
  //               >
  //                 Try again
  //               </button>
  //             </div>
  //           ) : thread ? (
  //             <div className="space-y-5 p-5">
  //               <div>
  //                 <h2 className="text-lg font-bold leading-7 text-slate-900">
  //                   {thread.subject || "(No subject)"}
  //                 </h2>

  //                 <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
  //                   <UserRound size={16} />
  //                   <span>{getSender(thread.participants)}</span>
  //                 </div>

  //                 <p className="mt-2 text-xs text-slate-400">
  //                   Last message: {getTime(thread.lastMessageAt)}
  //                 </p>
  //               </div>

  //               <div className="flex flex-wrap gap-2">
  //                 <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
  //                   {thread.currentClassification}
  //                 </span>

  //                 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
  //                   {thread.priority} priority
  //                 </span>
  //               </div>

  //               {thread.summary && (
  //                 <div className="rounded-xl bg-purple-50 p-4">
  //                   <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
  //                     Conversation summary
  //                   </p>

  //                   <p className="mt-2 text-sm leading-6 text-slate-700">
  //                     {thread.summary}
  //                   </p>
  //                 </div>
  //               )}

  //               {analysis && (
  //                 <div className="rounded-xl border border-slate-200 p-4">
  //                   <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
  //                     Latest AI analysis
  //                   </p>

  //                   <p className="mt-2 text-sm text-slate-700">
  //                     {analysis.reason || analysis.suggestedAction || "Analysis available."}
  //                   </p>
  //                 </div>
  //               )}

  //               <div>
  //                 <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
  //                   <Mail size={17} />
  //                   Messages ({messages.length})
  //                 </h3>

  //                 {messages.length ? (
  //                   <div className="space-y-3">
  //                     {messages.map((message, index) => (
  //                       <article
  //                         key={message._id || index}
  //                         className="rounded-xl border border-slate-200 p-4"
  //                       >
  //                         <div className="flex flex-wrap justify-between gap-2">
  //                           <p className="text-sm font-semibold text-slate-800">
  //                             {message.from || message.sender || "Email participant"}
  //                           </p>

  //                           <p className="text-xs text-slate-400">
  //                             {getTime(message.sentAt || message.createdAt)}
  //                           </p>
  //                         </div>

  //                         <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
  //                           {message.body || message.text || message.snippet || "Message content unavailable."}
  //                         </p>
  //                       </article>
  //                     ))}
  //                   </div>
  //                 ) : (
  //                   <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
  //                     No message records were returned for this conversation.
  //                   </p>
  //                 )}
  //               </div>
  //             </div>
  //           ) : (
  //             <div className="p-6 text-sm text-slate-500">
  //               Conversation details are unavailable.
  //             </div>
  //           )}
  //         </section>
  //       )}
  //     </div>
  //   </div>
  // );
return (
  <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-purple-600">
          MAILPILOT INBOX
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {segmentInfo.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {segmentInfo.description}
        </p>
      </div>

      <button
        type="button"
        onClick={fetchThreads}
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

    <ThreadFilters
      search={searchInput}
      onSearchChange={setSearchInput}
      priority={priority}
      onPriorityChange={(value) => {
        setPriority(value);
        setPage(1);
      }}
      unread={unread}
      onUnreadChange={(value) => {
        setUnread(value);
        setPage(1);
      }}
      important={important}
      onImportantChange={(value) => {
        setImportant(value);
        setPage(1);
      }}
      onClear={clearFilters}
    />

    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-slate-500">
        {loading
          ? "Loading conversations..."
          : `${total} conversation(s) found`}
      </p>

      <p className="text-xs text-slate-400">
        Page {page} of {totalPages}
      </p>
    </div>

    <div className="min-w-0">
      <ThreadList
        threads={threads}
        loading={loading}
        error={error}
        onRetry={fetchThreads}
        onSelect={openThread}
        onAction={handleAction}
        emptyTitle="No conversations found"
        emptyDescription="Try changing your search or filters, or check another inbox section."
      />

      {!loading && !error && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((current) => Math.max(1, current - 1))
            }
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={17} />
            Previous
          </button>

          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) =>
                Math.min(totalPages, current + 1)
              )
            }
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  </div>
);

}
