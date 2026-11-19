// import {
//   AlertTriangle,
//   Brain,
//   CheckCircle2,
//   Lightbulb,
// } from "lucide-react";

// const classificationLabels = {
//   ASSISTANT: "Assistant Action",
//   CLIENT: "Client Action",
//   NO_REPLY: "No Reply Needed",
//   REVIEW: "Needs Review",
// };

// const priorityStyles = {
//   HIGH: "bg-red-100 text-red-700",
//   MEDIUM: "bg-amber-100 text-amber-700",
//   LOW: "bg-green-100 text-green-700",
// };

// export default function AIAnalysisPanel({
//   thread,
//   analysis,
// }) {
//   const aiClassification =
//     analysis?.classification || thread.aiClassification;

//   const confidence =
//     analysis?.confidence ?? thread.confidence;

//   const summary =
//     analysis?.summary || thread.summary;

//   const reason =
//     analysis?.reason || thread.reason;

//   const priority =
//     analysis?.priority || thread.priority;

//   const suggestedAction =
//     analysis?.suggestedAction || thread.suggestedAction;

//   const needsReview =
//     thread.needsReview || thread.currentClassification === "REVIEW";

//   const confidencePercent =
//     typeof confidence === "number"
//       ? Math.round(confidence * 100)
//       : null;

//   return (
//     <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//       <div className="flex items-center gap-2">
//         <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
//           <Brain size={19} />
//         </div>

//         <div>
//           <h2 className="font-semibold text-slate-900">
//             AI Analysis
//           </h2>

//           <p className="text-xs text-slate-500">
//             Recommendation and reasoning
//           </p>
//         </div>
//       </div>

//       {needsReview && (
//         <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
//           <AlertTriangle
//             size={18}
//             className="mt-0.5 shrink-0 text-amber-600"
//           />

//           <div>
//             <p className="text-sm font-semibold text-amber-800">
//               Needs review
//             </p>

//             <p className="mt-1 text-xs leading-5 text-amber-700">
//               This conversation has been flagged for manual attention.
//               Review the messages and AI recommendation before proceeding.
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="mt-5 space-y-5">
//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Current classification
//           </p>

//           <p className="mt-1 font-semibold text-slate-900">
//             {classificationLabels[thread.currentClassification] ||
//               thread.currentClassification ||
//               "Not classified"}
//           </p>
//         </div>

//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             AI recommendation
//           </p>

//           <p className="mt-1 font-semibold text-purple-700">
//             {classificationLabels[aiClassification] ||
//               aiClassification ||
//               "Not available"}
//           </p>
//         </div>

//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Confidence
//           </p>

//           {confidencePercent !== null ? (
//             <>
//               <div className="mt-2 flex items-center justify-between text-sm">
//                 <span className="font-semibold text-slate-800">
//                   {confidencePercent}%
//                 </span>
//               </div>

//               <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
//                 <div
//                   className="h-full rounded-full bg-purple-500"
//                   style={{
//                     width: `${Math.min(
//                       100,
//                       Math.max(0, confidencePercent)
//                     )}%`,
//                   }}
//                 />
//               </div>
//             </>
//           ) : (
//             <p className="mt-1 text-sm text-slate-500">
//               Not available
//             </p>
//           )}
//         </div>

//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Priority
//           </p>

//           <span
//             className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
//               priorityStyles[priority] ||
//               "bg-slate-100 text-slate-600"
//             }`}
//           >
//             {priority || "Not specified"}
//           </span>
//         </div>

//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Conversation summary
//           </p>

//           <p className="mt-2 text-sm leading-6 text-slate-700">
//             {summary || "No summary is available yet."}
//           </p>
//         </div>

//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//             Why was it classified this way?
//           </p>

//           <p className="mt-2 text-sm leading-6 text-slate-700">
//             {reason || "No classification reason is available yet."}
//           </p>
//         </div>

//         <div className="rounded-xl bg-purple-50 p-4">
//           <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
//             <Lightbulb size={15} />
//             Suggested action
//           </p>

//           <p className="mt-2 text-sm leading-6 text-slate-700">
//             {suggestedAction || "No suggested action is available."}
//           </p>
//         </div>

//         {thread.manuallyOverridden && (
//           <div className="flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-800">
//             <CheckCircle2 size={17} className="shrink-0" />

//             <div>
//               <p className="font-semibold">
//                 Classification manually overridden
//               </p>

//               {thread.overrideReason && (
//                 <p className="mt-1 text-xs leading-5">
//                   Reason: {thread.overrideReason}
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }


import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  CalendarDays,
  Loader2,
} from "lucide-react";

const classificationLabels = {
  ASSISTANT: "Assistant Action",
  CLIENT: "Client Action",
  NO_REPLY: "No Reply Needed",
  REVIEW: "Needs Review",
};

const priorityStyles = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-green-100 text-green-700",
};

const statusLabels = {
  SUCCESS: "Gemini analysis",
  FALLBACK: "Fallback analysis",
  ERROR: "Analysis error",
};

export default function AIAnalysisPanel({
  thread,
  analysis,
  onAnalyze,
  analyzing = false,
}) {
  const aiClassification =
    analysis?.classification || thread.aiClassification;

  const confidence =
    analysis?.confidence ?? thread.confidence;

  const summary =
    analysis?.summary || thread.summary;

  const clientSummary =
    analysis?.clientSummary || thread.clientSummary;

  const reason =
    analysis?.reason || thread.reason;

  const priority =
    analysis?.priority || thread.priority;

  const suggestedAction =
    analysis?.suggestedAction || thread.suggestedAction;

  const needsReview =
    thread.needsReview ||
    thread.currentClassification === "REVIEW";

  const confidencePercent =
    typeof confidence === "number"
      ? Math.round(confidence * 100)
      : null;

  const status = analysis?.status;
  const extractedDates = analysis?.extractedDates || [];

  const hasClassificationConflict =
    thread.manuallyOverridden &&
    aiClassification &&
    aiClassification !== thread.currentClassification;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
            <Brain size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              AI Analysis
            </h2>

            <p className="text-xs text-slate-500">
              Recommendation and reasoning
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Analyze with AI
            </>
          )}
        </button>
      </div>

      {status && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {statusLabels[status] || status}
          </span>

          {analysis?.provider && (
            <span className="text-xs text-slate-400">
              Provider: {analysis.provider}
            </span>
          )}

          {analysis?.model && (
            <span className="text-xs text-slate-400">
              Model: {analysis.model}
            </span>
          )}
        </div>
      )}

      {needsReview && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="text-sm font-semibold text-amber-800">
              Needs review
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              This conversation has been flagged for manual attention.
              Review the messages and AI recommendation before proceeding.
            </p>
          </div>
        </div>
      )}

      {status === "FALLBACK" && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Gemini analysis was unavailable. A rule-based fallback
          recommendation was generated. Treat it as provisional and
          review the conversation manually.
        </div>
      )}

      {status === "ERROR" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
          AI analysis could not be completed. The conversation requires
          manual review.
        </div>
      )}

      {hasClassificationConflict && (
        <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-3">
          <p className="text-sm font-semibold text-purple-800">
            AI suggests a different owner
          </p>

          <p className="mt-1 text-xs leading-5 text-purple-700">
            Your manual classification is still active. The latest AI
            recommendation is{" "}
            <strong>
              {classificationLabels[aiClassification] || aiClassification}
            </strong>
            , while the current classification remains{" "}
            <strong>
              {classificationLabels[thread.currentClassification] ||
                thread.currentClassification}
            </strong>
            .
          </p>
        </div>
      )}

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current classification
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {classificationLabels[thread.currentClassification] ||
              thread.currentClassification ||
              "Not classified"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            AI recommendation
          </p>

          <p className="mt-1 font-semibold text-purple-700">
            {classificationLabels[aiClassification] ||
              aiClassification ||
              "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Confidence
          </p>

          {confidencePercent !== null ? (
            <>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">
                  {confidencePercent}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, confidencePercent)
                    )}%`,
                  }}
                />
              </div>

              {confidence < 0.7 && (
                <p className="mt-2 text-xs text-red-600">
                  Low confidence. Manual review is required.
                </p>
              )}

              {confidence >= 0.7 && confidence < 0.9 && (
                <p className="mt-2 text-xs text-amber-600">
                  Moderate confidence. Please verify the recommendation.
                </p>
              )}

              {confidence >= 0.9 && (
                <p className="mt-2 text-xs text-green-600">
                  High confidence. Human review is still recommended.
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Not available
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Priority
          </p>

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              priorityStyles[priority] ||
              "bg-slate-100 text-slate-600"
            }`}
          >
            {priority || "Not specified"}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Conversation summary
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {summary || "No summary is available yet."}
          </p>
        </div>

        {clientSummary && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Client-friendly summary
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {clientSummary}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Why was it classified this way?
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {reason || "No classification reason is available yet."}
          </p>
        </div>

        <div className="rounded-xl bg-purple-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-700">
            <Lightbulb size={15} />
            Suggested action
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {suggestedAction || "No suggested action is available."}
          </p>
        </div>

        {extractedDates.length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <CalendarDays size={14} />
              Extracted dates and deadlines
            </p>

            <div className="mt-3 space-y-2">
              {extractedDates.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {item.dateTime
                      ? new Date(item.dateTime).toLocaleString()
                      : "Date unavailable"}
                  </p>

                  {item.timezone && (
                    <p className="mt-1 text-xs text-slate-400">
                      Time zone: {item.timezone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {thread.manuallyOverridden && (
          <div className="flex gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 size={17} className="shrink-0" />

            <div>
              <p className="font-semibold">
                Classification manually overridden
              </p>

              {thread.overrideReason && (
                <p className="mt-1 text-xs leading-5">
                  Reason: {thread.overrideReason}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
