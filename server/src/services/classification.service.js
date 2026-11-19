
const Thread = require("../models/Thread");
const AIAnalysis = require("../models/AIAnalysis");
const Activity = require("../models/Activity");

const {
  analyzeThreadWithAI,
  buildThreadContext,
} = require("./ai.service");

const {
  syncWaitingForResponse,
} = require("./waiting-status.service");

const CLASSIFICATIONS = [
  "ASSISTANT",
  "CLIENT",
  "NO_REPLY",
  "REVIEW",
];

// --------------------------------------------------
// 1. Conservative fallback classifier
// --------------------------------------------------

const classifyWithFallback = (conversation) => {
  const messages = conversation.messages || [];

  const subject = conversation.subject || "";

  const conversationText = [
    subject,
    ...messages.map((message) => message.body || ""),
  ].join(" ").toLowerCase();

  const latestMessage = messages[messages.length - 1];

  let classification = "REVIEW";
  let category = "General";
  let reason = "The conversation is ambiguous and needs human review.";
  let suggestedAction = "Review the conversation manually.";
  let confidence = 0.45;

  // Clear automated notifications, receipts and newsletters.
//   const noReplyPatterns = [
//     /\bno[- ]?reply\b/,
//     /\bdo not reply\b/,
//     /\bunsubscribe\b/,
//     /\bnewsletter\b/,
//     /\border confirmation\b/,
//     /\bpayment receipt\b/,
//     /\bpayment successful\b/,
//     /\bsubscription confirmation\b/,
//     /\bautomated notification\b/,
//   ];

const noReplyPatterns = [
  /\bno[- ]?reply\b/,
  /\bdo not reply\b/,
  /\bunsubscribe\b/,
  /\bnewsletter\b/,
  /\border confirmation\b/,
  /\bpayment receipt\b/,
  /\bpayment successful\b/,
  /\bsubscription confirmation\b/,
  /\bautomated notification\b/,
  /\baccount statement\b/,
  /\bmonthly statement\b/,
  /\bbank statement\b/,
  /\bstatement is now available\b/,
  /\bstatement available\b/,
  /\byour statement\b/,
];

  // Scheduling and coordination.
  const assistantPatterns = [
    /\bschedule a meeting\b/,
    /\bmeeting availability\b/,
    /\bavailable on\b/,
    /\bconfirm the meeting\b/,
    /\breschedule\b/,
    /\bappointment\b/,
    /\bcalendar invitation\b/,
    /\bbook a meeting\b/,
    /\bconfirm a time\b/,
  ];

  // Decisions requiring the client's personal approval.
  const clientPatterns = [
    /\bapprove\b/,
    /\bapproval required\b/,
    /\bsign off\b/,
    /\bauthorize\b/,
    /\bauthorise\b/,
    /\bfinal decision\b/,
    /\bpersonal decision\b/,
    /\bapprove or reject\b/,
    /\baccept or decline\b/,
    /\blegal decision\b/,
    /\bstrategic decision\b/,
    /\bbudget approval\b/,
  ];

  const matchesPattern = (patterns) =>
    patterns.some((pattern) => pattern.test(conversationText));

  const isNoReply = matchesPattern(noReplyPatterns);
  const isAssistant = matchesPattern(assistantPatterns);
  const isClient = matchesPattern(clientPatterns);

  // Conflicting signals should never produce a confident guess.
  if (
    Number(isNoReply) +
    Number(isAssistant) +
    Number(isClient) > 1
  ) {
    classification = "REVIEW";
    reason = "Conflicting signals were found in the conversation.";
  } else if (isNoReply) {
    classification = "NO_REPLY";
    category = "Notification";
    confidence = 0.65;
    reason = "The conversation appears to be an automated notification or informational email.";
    suggestedAction = "No reply appears necessary, but verify manually.";
  } else if (isAssistant) {
    classification = "ASSISTANT";
    category = "Scheduling";
    confidence = 0.65;
    reason = "The conversation contains scheduling or coordination language.";
    suggestedAction = "Review the scheduling request and coordinate with the sender.";
  } else if (isClient) {
    classification = "CLIENT";
    category = "Approval";
    confidence = 0.65;
    reason = "The conversation contains language suggesting a personal decision or approval is required.";
    suggestedAction = "Ask the client to review and make the required decision.";
  }

  const isUrgent =
    /\b(urgent|asap|immediately|critical|deadline|overdue)\b/i.test(
      conversationText
    );

  const priority =
    classification === "NO_REPLY"
      ? "LOW"
      : isUrgent
        ? "HIGH"
        : "MEDIUM";

  const waitingForResponse =
    latestMessage?.direction === "INBOUND";

  return {
    classification,
    confidence,
    summary: "Fallback analysis was used because Gemini could not provide a valid result.",
    clientSummary: "This conversation needs a manual review.",
    reason,
    actionRequired: classification !== "NO_REPLY",
    priority,
    category,
    suggestedAction,
    waitingForResponse,
    extractedDates: [],
  };
};

// --------------------------------------------------
// 2. Build a safe REVIEW result when analysis fails
// --------------------------------------------------

const createReviewResult = () => ({
  classification: "REVIEW",
  confidence: 0,
  summary: "AI analysis could not be completed.",
  clientSummary: "Please review this email conversation manually.",
  reason: "The AI response was unavailable or invalid. Human review is required.",
  actionRequired: true,
  priority: "MEDIUM",
  category: "Needs Review",
  suggestedAction: "Read the conversation and assign the correct classification.",
  waitingForResponse: false,
  extractedDates: [],
});

// --------------------------------------------------
// 3. Run classification and save analysis history
// --------------------------------------------------

const analyzeAndSaveThread = async (threadId, performedBy = null) => {
  const thread = await Thread.findById(threadId);

  if (!thread) {
    throw new Error("Email thread not found");
  }

  let result;
  let provider = "gemini";
  let model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let status = "SUCCESS";

  try {
    // First attempt: real Gemini analysis.
    const aiResult = await analyzeThreadWithAI(threadId);

    result = aiResult.data;
    provider = aiResult.provider;
    model = aiResult.model;


  } catch (error) {
    const errorMessage = error?.message || "";

    // Log the actual Gemini failure without exposing credentials.
    console.error("\n========== MAILPILOT GEMINI ERROR ==========");
    console.error("Error name:", error?.name || "Unknown");
    console.error("Error message:", errorMessage);
    console.error("Error status:", error?.status || "Not provided");
    console.error("Error code:", error?.code || "Not provided");

    if (error?.validationErrors) {
      console.error("Validation errors:", error.validationErrors);
    }

    console.error("============================================\n");

    const isInvalidAIResponse =
      errorMessage.includes("invalid JSON") ||
      errorMessage.includes("failed validation") ||
      errorMessage.includes("empty response");

    if (isInvalidAIResponse) {
      result = createReviewResult();
      status = "ERROR";
    } else {
      try {
        const conversation = await buildThreadContext(threadId);

        result = classifyWithFallback(conversation);

        provider = "fallback";
        model = "keyword-rules";
        status = "FALLBACK";
      } catch (fallbackError) {
        console.error(
          "[MailPilot] Fallback classification failed:",
          fallbackError?.message || fallbackError
        );

        result = createReviewResult();
        provider = "fallback";
        model = "keyword-rules";
        status = "ERROR";
      }
    }
  }


//   } catch (error) {
//     const errorMessage = error.message || "";

//     const isInvalidAIResponse =
//       errorMessage.includes("invalid JSON") ||
//       errorMessage.includes("failed validation") ||
//       errorMessage.includes("empty response");

//     if (isInvalidAIResponse) {
//       // Invalid output must be recorded as an error.
//       result = createReviewResult();
//       status = "ERROR";
//     } else {
//       // Provider/network failure: try the conservative fallback.
//       try {
//         const conversation = await buildThreadContext(threadId);

//         result = classifyWithFallback(conversation);

//         provider = "fallback";
//         model = "keyword-rules";
//         status = "FALLBACK";
//       } catch (fallbackError) {
//         // If even fallback cannot analyse the thread, require review.
//         result = createReviewResult();
//         provider = "fallback";
//         model = "keyword-rules";
//         status = "ERROR";
//       }
//     }
//   }

  // Validate once more before writing to MongoDB.
  if (
    !CLASSIFICATIONS.includes(result.classification) ||
    !Number.isFinite(result.confidence) ||
    result.confidence < 0 ||
    result.confidence > 1
  ) {
    result = createReviewResult();
    status = "ERROR";
    provider = "gemini";
  }

  // Save every analysis, including fallback and errors.
  const analysis = await AIAnalysis.create({
    threadId,
    ...result,
    provider,
    model,
    status,
    analyzedAt: new Date(),
  });

  // ------------------------------------------------
  // 4. Apply confidence and manual override policies
  // ------------------------------------------------

  const previousClassification = thread.currentClassification;

  const hasManualOverride = thread.manuallyOverridden === true;

  const isLowConfidence = result.confidence < 0.70;

  const isMediumConfidence =
    result.confidence >= 0.70 &&
    result.confidence < 0.90;

  const conflictsWithManualDecision =
    hasManualOverride &&
    previousClassification !== result.classification;

  let newCurrentClassification = previousClassification;

  if (!hasManualOverride) {
    if (
      status !== "SUCCESS" ||
      isLowConfidence
    ) {
      newCurrentClassification = "REVIEW";
    } else {
      newCurrentClassification = result.classification;
    }
  }

  const needsReview =
    status !== "SUCCESS" ||
    result.classification === "REVIEW" ||
    isLowConfidence ||
    isMediumConfidence ||
    conflictsWithManualDecision;

  // ------------------------------------------------
  // 5. Update the thread without overwriting overrides
  // ------------------------------------------------

  thread.aiClassification = result.classification;
  thread.confidence = result.confidence;
  thread.reason = result.reason;
  thread.summary = result.summary;
  thread.clientSummary = result.clientSummary;
  thread.suggestedAction = result.suggestedAction;
  thread.priority = result.priority;
  thread.category = result.category;

  // thread.actionRequired = result.actionRequired;
  // thread.waitingForResponse = result.waitingForResponse;
  // thread.needsReview = needsReview;

thread.actionRequired = result.actionRequired;

// Always calculate waiting status from the latest database message.
thread.waitingForResponse = await syncWaitingForResponse(thread._id);

thread.needsReview = needsReview;

  if (!hasManualOverride) {
    thread.currentClassification = newCurrentClassification;
  }

  await thread.save();

  // ------------------------------------------------
  // 6. Record activity history
  // ------------------------------------------------

  if (performedBy) {
    await Activity.create({
      threadId,
      performedBy,
      actorRole: "assistant",
      action: "AI_ANALYSIS_COMPLETED",
      previousValue: previousClassification,
      newValue: result.classification,
      note:
        status === "SUCCESS"
          ? "Thread analysed successfully using Gemini."
          : status === "FALLBACK"
            ? "Gemini was unavailable. Fallback classification was used."
            : "AI analysis failed. Manual review is required.",
    });
  }

  return {
    success: true,
    thread,
    analysis,
    result: {
      classification: result.classification,
      currentClassification: thread.currentClassification,
      confidence: result.confidence,
      provider,
      model,
      status,
      needsReview,
      manuallyOverridden: hasManualOverride,
      conflictsWithManualDecision,
    },
  };
};

module.exports = {
  analyzeAndSaveThread,
  classifyWithFallback,
};
