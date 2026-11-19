
const mongoose = require("mongoose");

const Thread = require("../models/Thread");
const Message = require("../models/Message");
const AIAnalysis = require("../models/AIAnalysis");
const Activity = require("../models/Activity");
const EmailAccount = require("../models/EmailAccount");

const {
  analyzeAndSaveThread,
} = require("../services/classification.service");

const {
  getAssistantClient,
  buildThreadQuery,
} = require("../services/thread.service");

// Parse optional boolean query parameters.
const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

// GET /api/threads
const getThreads = async (req, res) => {
  const {
    segment = "all",
    search,
    priority,
    page = "1",
    limit = "10",
    sort = "newest",
  } = req.query;

  const allowedSegments = [
    "all",
    "assistant",
    "client",
    "no-reply",
    "review",
    "important",
    "waiting",
    "archived",
  ];

  if (!allowedSegments.includes(segment)) {
    return res.status(400).json({
      success: false,
      message: "Invalid segment",
    });
  }

  if (
    priority &&
    !["LOW", "MEDIUM", "HIGH"].includes(priority.toUpperCase())
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid priority",
    });
  }

  const unread = parseBoolean(req.query.unread);
  const important = parseBoolean(req.query.important);
  const archived = parseBoolean(req.query.archived);

  if (
    unread === null ||
    important === null ||
    archived === null
  ) {
    return res.status(400).json({
      success: false,
      message: "Boolean filters must be true or false",
    });
  }

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  if (
    !Number.isInteger(currentPage) ||
    currentPage < 1 ||
    !Number.isInteger(pageLimit) ||
    pageLimit < 1 ||
    pageLimit > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid page or limit",
    });
  }

  if (!["newest", "oldest"].includes(sort)) {
    return res.status(400).json({
      success: false,
      message: "Sort must be newest or oldest",
    });
  }

  // Derive the client from the authenticated assistant.
  const client = await getAssistantClient(req.user._id);

  // A new assistant without a client gets an empty inbox.
  if (!client) {
    return res.status(200).json({
      success: true,
      items: [],
      page: currentPage,
      limit: pageLimit,
      total: 0,
      totalPages: 0,
    });
  }

  const query = buildThreadQuery({
    assistantId: req.user._id,
    clientId: client._id,
    segment,
    search: search?.trim(),
    priority: priority?.toUpperCase(),
    unread,
    important,
    archived,
  });

  const skip = (currentPage - 1) * pageLimit;

  const sortOrder = sort === "oldest" ? 1 : -1;

  const [items, total] = await Promise.all([
    Thread.find(query)
      .sort({ lastMessageAt: sortOrder, _id: sortOrder })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    Thread.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    items,
    page: currentPage,
    limit: pageLimit,
    total,
    totalPages: Math.ceil(total / pageLimit),
  });
};

// GET /api/threads/:id
const getThreadById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Check both assistant and client ownership.
  const thread = await Thread.findOne({
    _id: id,
    assistantId: req.user._id,
    clientId: client._id,
  }).lean();

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const [messages, latestAnalysis, activities] = await Promise.all([
    Message.find({ threadId: thread._id })
      .sort({ sentAt: 1 })
      .lean(),

    AIAnalysis.findOne({ threadId: thread._id })
      .sort({ analyzedAt: -1 })
      .lean(),

    Activity.find({ threadId: thread._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  return res.status(200).json({
    success: true,
    thread,
    messages,
    latestAnalysis,
    activities,
  });
};

// PATCH /api/threads/:id
// const updateThread = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.isValidObjectId(id)) {
//     return res.status(404).json({
//       success: false,
//       message: "Thread not found",
//     });
//   }

//   const allowedFields = [
//     "isImportant",
//     "isUnread",
//     "isArchived",
//     "isDone",
//     "waitingForResponse",
//   ];

//   const updates = req.body;

//   if (
//     !updates ||
//     typeof updates !== "object" ||
//     Array.isArray(updates)
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid request body",
//     });
//   }

//   const receivedFields = Object.keys(updates);

//   if (
//     receivedFields.length === 0 ||
//     receivedFields.some((field) => !allowedFields.includes(field))
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "Only supported thread fields can be updated",
//       allowedFields,
//     });
//   }

//   for (const field of receivedFields) {
//     if (typeof updates[field] !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: `${field} must be a boolean`,
//       });
//     }
//   }

//   const client = await getAssistantClient(req.user._id);

//   if (!client) {
//     return res.status(404).json({
//       success: false,
//       message: "Thread not found",
//     });
//   }

//   const thread = await Thread.findOne({
//     _id: id,
//     assistantId: req.user._id,
//     clientId: client._id,
//   });

//   if (!thread) {
//     return res.status(404).json({
//       success: false,
//       message: "Thread not found",
//     });
//   }

//   const activityRecords = [];

//   const actionNames = {
//     isImportant: (value) =>
//       value ? "MARKED_IMPORTANT" : "UNMARKED_IMPORTANT",

//     isUnread: (value) =>
//       value ? "MARKED_UNREAD" : "MARKED_READ",

//     isArchived: (value) =>
//       value ? "ARCHIVED" : "UNARCHIVED",

//     isDone: (value) =>
//       value ? "MARKED_DONE" : "REOPENED",

//     waitingForResponse: (value) =>
//       value
//         ? "MARKED_WAITING_FOR_RESPONSE"
//         : "MARKED_NOT_WAITING",
//   };

//   for (const field of receivedFields) {
//     const previousValue = thread[field];
//     const newValue = updates[field];

//     // Do not create activity for unchanged values.
//     if (previousValue === newValue) continue;

//     thread[field] = newValue;

//     activityRecords.push({
//       threadId: thread._id,
//       performedBy: req.user._id,
//       actorRole: "assistant",
//       action: actionNames[field](newValue),
//       previousValue: String(previousValue),
//       newValue: String(newValue),
//       note: "",
//     });
//   }

//   await thread.save();

//   if (activityRecords.length > 0) {
//     await Activity.insertMany(activityRecords);
//   }

//   return res.status(200).json({
//     success: true,
//     message: "Thread updated successfully",
//     thread,
//   });
// };

// PATCH /api/threads/:id
const updateThread = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // const allowedFields = [
  //   "isImportant",
  //   "isUnread",
  //   "isArchived",
  //   "isDone",
  //   "waitingForResponse",
  //   "currentClassification",
  //   "overrideReason",
  // ];

const allowedFields = [
  "isImportant",
  "isUnread",
  "isArchived",
  "isDone",
];

  const updates = req.body;

  if (
    !updates ||
    typeof updates !== "object" ||
    Array.isArray(updates)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
  }

  const receivedFields = Object.keys(updates);

  if (
    receivedFields.length === 0 ||
    receivedFields.some((field) => !allowedFields.includes(field))
  ) {
    return res.status(400).json({
      success: false,
      message: "Only supported thread fields can be updated",
      allowedFields,
    });
  }

  // A reason can only be supplied with a classification change.
  if (
    receivedFields.includes("overrideReason") &&
    !receivedFields.includes("currentClassification")
  ) {
    return res.status(400).json({
      success: false,
      message: "overrideReason requires currentClassification",
    });
  }

  const booleanFields = [
    "isImportant",
    "isUnread",
    "isArchived",
    "isDone",
  ];

  for (const field of booleanFields) {
    if (
      receivedFields.includes(field) &&
      typeof updates[field] !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} must be a boolean`,
      });
    }
  }

  const classifications = [
    "ASSISTANT",
    "CLIENT",
    "NO_REPLY",
    "REVIEW",
  ];

  if (
    receivedFields.includes("currentClassification") &&
    !classifications.includes(updates.currentClassification)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid classification",
      allowedClassifications: classifications,
    });
  }

  if (
    receivedFields.includes("overrideReason") &&
    typeof updates.overrideReason !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "overrideReason must be a string",
    });
  }

  const overrideReason = (updates.overrideReason || "").trim();

  // if (overrideReason.length > 500) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Override reason cannot exceed 500 characters",
  //   });
  // }

  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const thread = await Thread.findOne({
    _id: id,
    assistantId: req.user._id,
    clientId: client._id,
  });

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const activityRecords = [];

  const actionNames = {
    isImportant: (value) =>
      value ? "MARKED_IMPORTANT" : "UNMARKED_IMPORTANT",

    isUnread: (value) =>
      value ? "MARKED_UNREAD" : "MARKED_READ",

    isArchived: (value) =>
      value ? "ARCHIVED" : "UNARCHIVED",

    isDone: (value) =>
      value ? "MARKED_DONE" : "REOPENED",
  };

  // Handle existing boolean actions.
  for (const field of booleanFields) {
    if (!receivedFields.includes(field)) continue;

    const previousValue = thread[field];
    const newValue = updates[field];

    if (previousValue === newValue) continue;

    thread[field] = newValue;

    activityRecords.push({
      threadId: thread._id,
      performedBy: req.user._id,
      actorRole: "assistant",
      action: actionNames[field](newValue),
      previousValue: String(previousValue),
      newValue: String(newValue),
      note: "",
    });
  }

  // Handle manual classification changes.
  // if (receivedFields.includes("currentClassification")) {
  //   const previousValue = thread.currentClassification;
  //   const newValue = updates.currentClassification;

  //   if (previousValue !== newValue) {
  //     thread.currentClassification = newValue;
  //     thread.manuallyOverridden = true;
  //     thread.overrideBy = req.user._id;
  //     thread.overrideAt = new Date();
  //     thread.overrideReason = overrideReason;

  //     activityRecords.push({
  //       threadId: thread._id,
  //       performedBy: req.user._id,
  //       actorRole: "assistant",
  //       action: "CLASSIFICATION_CHANGED",
  //       previousValue,
  //       newValue,
  //       note: overrideReason,
  //     });
  //   } else if (overrideReason) {
  //     thread.overrideReason = overrideReason;
  //   }
  // }

  await thread.save();

  if (activityRecords.length > 0) {
    await Activity.insertMany(activityRecords);
  }

  return res.status(200).json({
    success: true,
    message: "Thread updated successfully",
    thread,
  });
};


const CLASSIFICATIONS = ["ASSISTANT", "CLIENT", "NO_REPLY", "REVIEW"];

// PATCH /api/threads/:id/classification
const updateThreadClassification = async (req, res) => {
  const { id } = req.params;
  const { classification, reason = "" } = req.body;

  // Validate thread ID.
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Validate request body.
  if (
    !classification ||
    !CLASSIFICATIONS.includes(classification)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid classification",
      allowedClassifications: CLASSIFICATIONS,
    });
  }

  if (typeof reason !== "string") {
    return res.status(400).json({
      success: false,
      message: "Reason must be a string",
    });
  }

  const trimmedReason = reason.trim();

  if (trimmedReason.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Reason cannot exceed 500 characters",
    });
  }

  // Find the assistant's client.
  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Verify thread ownership.
  const thread = await Thread.findOne({
    _id: id,
    assistantId: req.user._id,
    clientId: client._id,
  });

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const previousClassification = thread.currentClassification;

  // Avoid unnecessary activity records for unchanged classifications.
  if (previousClassification === classification) {
    return res.status(200).json({
      success: true,
      message: "Classification is already set to this value",
      thread,
    });
  }

  // Save the human decision. Do not modify aiClassification.
  thread.currentClassification = classification;
  thread.manuallyOverridden = true;
  thread.overrideBy = req.user._id;
  thread.overrideAt = new Date();
  thread.overrideReason = trimmedReason;

  await thread.save();

  // Record the manual decision.
  await Activity.create({
    threadId: thread._id,
    performedBy: req.user._id,
    actorRole: "assistant",
    action: "CLASSIFICATION_CHANGED",
    previousValue: previousClassification,
    newValue: classification,
    note: trimmedReason,
  });

  return res.status(200).json({
    success: true,
    message: "Classification manually updated",
    thread,
  });
};


// PATCH /api/threads/:id/classification/reset
const resetThreadClassification = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Verify ownership.
  const thread = await Thread.findOne({
    _id: id,
    assistantId: req.user._id,
    clientId: client._id,
  });

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Find the most recent AI recommendation.
  const latestAnalysis = await AIAnalysis.findOne({
    threadId: thread._id,
  }).sort({ analyzedAt: -1 });

  const aiRecommendation =
    latestAnalysis?.classification || thread.aiClassification;

  if (!CLASSIFICATIONS.includes(aiRecommendation)) {
    return res.status(409).json({
      success: false,
      message: "No valid AI recommendation is available to reset to",
    });
  }

  const previousClassification = thread.currentClassification;
  const hadManualOverride = thread.manuallyOverridden;

  // Restore the latest AI recommendation.
  thread.currentClassification = aiRecommendation;

  // Clear manual override metadata.
  thread.manuallyOverridden = false;
  thread.overrideBy = null;
  thread.overrideAt = null;
  thread.overrideReason = "";

  await thread.save();

  // Record the reset in the activity timeline.
  if (hadManualOverride || previousClassification !== aiRecommendation) {
    await Activity.create({
      threadId: thread._id,
      performedBy: req.user._id,
      actorRole: "assistant",
      action: "CLASSIFICATION_RESET_TO_AI",
      previousValue: previousClassification,
      newValue: aiRecommendation,
      note: "Manual override reset to the latest AI recommendation.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Classification reset to the latest AI recommendation",
    thread,
  });
};


// POST /api/threads/:id/analyze
const analyzeThread = async (req, res) => {
  const { id } = req.params;

  // Validate thread ID.
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Find the client assigned to the authenticated assistant.
  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Verify that this thread belongs to this assistant and client.
  const thread = await Thread.findOne({
    _id: id,
    assistantId: req.user._id,
    clientId: client._id,
  }).select("_id");

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  // Run Gemini analysis, fallback if needed, and save the result.
  const analysisResult = await analyzeAndSaveThread(
    thread._id,
    req.user._id
  );

  return res.status(200).json({
    success: true,
    message:
      analysisResult.result.status === "SUCCESS"
        ? "AI analysis completed successfully"
        : analysisResult.result.status === "FALLBACK"
          ? "Fallback analysis completed. Manual review is required."
          : "AI analysis failed. Manual review is required.",
    thread: analysisResult.thread,
    analysis: analysisResult.analysis,
    result: analysisResult.result,
  });
};

// --------------------------------------------------
// POST /api/threads/simulate-incoming
// --------------------------------------------------

const DEMO_EMAIL_SCENARIOS = {
  meeting: {
    senderName: "Sarah Wilson",
    senderEmail: "sarah.wilson@demo-company.test",
    subject: "Meeting availability for next week",
    body: "Hello, could you please share your client's availability for a meeting next week? We would like to schedule a 30-minute discussion. Please suggest a suitable date and time.",
  },

  approval: {
    senderName: "Michael Brown",
    senderEmail: "michael.brown@finance-demo.test",
    subject: "Budget approval required",
    body: "Hello, the proposed project budget is ready for review. We need your client's approval before proceeding. Please review the amount and let us know whether the budget is approved.",
  },

  newsletter: {
    senderName: "Demo Newsletter",
    senderEmail: "newsletter@updates-demo.test",
    subject: "Your monthly product newsletter",
    body: "Here is your monthly newsletter with product updates, announcements, and useful resources. You are receiving this automated email because you subscribed to our newsletter. Unsubscribe at any time.",
  },

  ambiguous: {
    senderName: "Alex Taylor",
    senderEmail: "alex.taylor@example-demo.test",
    subject: "Following up on our previous discussion",
    body: "Hello, I wanted to follow up on our previous discussion. Please take a look when you have some time. Let me know what you think.",
  },
};

const simulateIncomingEmail = async (req, res) => {
  const { scenario } = req.body || {};

  let emailData;

  // Use a predefined scenario or validate custom email fields.
  if (scenario !== undefined) {
    if (
      typeof scenario !== "string" ||
      !Object.prototype.hasOwnProperty.call(
        DEMO_EMAIL_SCENARIOS,
        scenario
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo scenario",
        allowedScenarios: Object.keys(DEMO_EMAIL_SCENARIOS),
      });
    }

    // Copy the trusted server-side scenario.
    emailData = { ...DEMO_EMAIL_SCENARIOS[scenario] };
  } else {
    const { senderName, senderEmail, subject, body } = req.body || {};

    if (
      typeof senderName !== "string" ||
      typeof senderEmail !== "string" ||
      typeof subject !== "string" ||
      typeof body !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a valid scenario or senderName, senderEmail, subject, and body",
      });
    }

    emailData = {
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim().toLowerCase(),
      subject: subject.trim(),
      body: body.trim(),
    };
  }

  // Validate all email fields, including predefined scenario data.
  if (
    emailData.senderName.length < 2 ||
    emailData.senderName.length > 100 ||
    emailData.senderEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.senderEmail) ||
    emailData.subject.length < 2 ||
    emailData.subject.length > 200 ||
    emailData.body.length < 5 ||
    emailData.body.length > 10000
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid email fields or field lengths",
    });
  }

  // Derive the client from the authenticated assistant.
  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "No client is assigned to this assistant",
    });
  }

  // Find an existing connected demo account owned by this assistant.
  const emailAccount = await EmailAccount.findOne({
    userId: req.user._id,
    clientId: client._id,
    connectionStatus: "connected",
    isMock: true,
  }).sort({ createdAt: -1 });

  if (!emailAccount) {
    return res.status(409).json({
      success: false,
      message: "Connect a demo email account before simulating incoming email",
    });
  }

  const receivedAt = new Date();

  // Reuse a matching conversation if one already exists.
  // Ownership and account filters prevent cross-client access.
  let thread = await Thread.findOne({
    assistantId: req.user._id,
    clientId: client._id,
    emailAccountId: emailAccount._id,
    subject: emailData.subject,
  });

  let isNewThread = false;

  if (!thread) {
    isNewThread = true;

    thread = await Thread.create({
      assistantId: req.user._id,
      clientId: client._id,
      emailAccountId: emailAccount._id,
      subject: emailData.subject,
      participants: [
        emailData.senderEmail,
        emailAccount.emailAddress,
      ],
      snippet: emailData.body.slice(0, 180),
      aiClassification: "REVIEW",
      currentClassification: "REVIEW",
      needsReview: true,
      isUnread: true,
      lastMessageAt: receivedAt,
    });
  } else {
    // Add the sender if they are not already a participant.
    if (
      !thread.participants.some(
        (email) => email.toLowerCase() === emailData.senderEmail
      )
    ) {
      thread.participants.push(emailData.senderEmail);
    }

    thread.lastMessageAt = receivedAt;
    thread.snippet = emailData.body.slice(0, 180);
    thread.isUnread = true;

    await thread.save();
  }

  // Save the incoming message.
  const message = await Message.create({
    threadId: thread._id,
    senderName: emailData.senderName,
    senderEmail: emailData.senderEmail,
    recipients: [emailAccount.emailAddress],
    body: emailData.body,
    direction: "INBOUND",
    sentAt: receivedAt,
    isSimulated: true,
  });

  // Run the existing AI service. It handles Gemini fallback and
  // preserves any manual classification override.
  const analysisResult = await analyzeAndSaveThread(
    thread._id,
    req.user._id
  );

  const analysisStatus = analysisResult.result.status;

  return res.status(201).json({
    success: true,
    message:
      analysisStatus === "SUCCESS"
        ? "Incoming email received and analyzed successfully"
        : "Incoming email received. Manual review is required.",
    isNewThread,
    thread: analysisResult.thread,
    messageRecord: message,
    analysis: analysisResult.analysis,
    result: analysisResult.result,
    analysisStatus,
  });
};

// GET /api/threads/upcoming-dates
const getUpcomingDates = async (req, res) => {
  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(200).json({
      success: true,
      items: [],
      total: 0,
    });
  }

  // Only include conversations owned by this assistant and client.
  const threads = await Thread.find({
    assistantId: req.user._id,
    clientId: client._id,
    isArchived: false,
    isDone: false,
  })
    .select("_id subject")
    .lean();

  if (threads.length === 0) {
    return res.status(200).json({
      success: true,
      items: [],
      total: 0,
    });
  }

  const threadIds = threads.map((thread) => thread._id);
  const now = new Date();

  // Get only the latest AI analysis for each conversation.
  const dates = await AIAnalysis.aggregate([
    {
      $match: {
        threadId: { $in: threadIds },
      },
    },
    {
      $sort: {
        analyzedAt: -1,
        _id: -1,
      },
    },
    {
      $group: {
        _id: "$threadId",
        extractedDates: { $first: "$extractedDates" },
      },
    },
    {
      $unwind: "$extractedDates",
    },
    {
      $match: {
        "extractedDates.dateTime": { $gte: now },
      },
    },
    {
      $project: {
        _id: 0,
        threadId: "$_id",
        label: "$extractedDates.label",
        dateTime: "$extractedDates.dateTime",
        timezone: "$extractedDates.timezone",
      },
    },
    {
      $sort: {
        dateTime: 1,
      },
    },
    {
      $limit: 20,
    },
  ]);

  const threadMap = new Map(
    threads.map((thread) => [
      thread._id.toString(),
      thread.subject,
    ])
  );

  const items = dates.map((date) => ({
    ...date,
    subject: threadMap.get(date.threadId.toString()) || "Untitled conversation",
  }));

  return res.status(200).json({
    success: true,
    items,
    total: items.length,
  });
};


// GET /api/threads/stats
const getThreadStats = async (req, res) => {
  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(200).json({
      success: true,
      stats: {
        totalActive: 0,
        unread: 0,
        assistantAction: 0,
        clientActionPending: 0,
        needsReview: 0,
        waiting: 0,
      },
    });
  }

  const baseQuery = {
    assistantId: req.user._id,
    clientId: client._id,
    isArchived: false,
    isDone: false,
  };

  const [
    totalActive,
    unread,
    assistantAction,
    clientActionPending,
    needsReview,
    waiting,
  ] = await Promise.all([
    Thread.countDocuments(baseQuery),

    Thread.countDocuments({
      ...baseQuery,
      isUnread: true,
    }),

    Thread.countDocuments({
      ...baseQuery,
      currentClassification: "ASSISTANT",
    }),

    Thread.countDocuments({
      ...baseQuery,
      currentClassification: "CLIENT",
      clientStatus: "PENDING",
    }),

    Thread.countDocuments({
      ...baseQuery,
      $or: [
        { currentClassification: "REVIEW" },
        { needsReview: true },
      ],
    }),

    Thread.countDocuments({
      ...baseQuery,
      waitingForResponse: true,
    }),
  ]);

  return res.status(200).json({
    success: true,
    stats: {
      totalActive,
      unread,
      assistantAction,
      clientActionPending,
      needsReview,
      waiting,
    },
  });
};

module.exports = {
  getThreads,
  getThreadById,
  updateThread,
  updateThreadClassification,
  resetThreadClassification,
  analyzeThread,
  getThreadStats,
  simulateIncomingEmail,
  getUpcomingDates,
};