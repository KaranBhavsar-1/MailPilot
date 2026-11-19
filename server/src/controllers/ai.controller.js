
const mongoose = require("mongoose");

const Thread = require("../models/Thread");
const Draft = require("../models/Draft");

const { getAssistantClient } = require("../services/thread.service");
const { generateReplyDraft } = require("../services/ai.service");

const {
  generateInboxChatAnswer,
} = require("../services/ai.service");

// POST /api/ai/draft/:threadId
const createReplyDraft = async (req, res) => {
  const { threadId } = req.params;
  const { tone = "professional", instruction = "" } = req.body || {};

  if (!mongoose.isValidObjectId(threadId)) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const allowedTones = [
    "professional",
    "friendly",
    "formal",
    "concise",
    "empathetic",
  ];

  if (!allowedTones.includes(tone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reply tone",
      allowedTones,
    });
  }

  if (
    typeof instruction !== "string" ||
    instruction.length > 500
  ) {
    return res.status(400).json({
      success: false,
      message: "Instruction must be a string of at most 500 characters",
    });
  }

  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const thread = await Thread.findOne({
    _id: threadId,
    assistantId: req.user._id,
    clientId: client._id,
  });

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Thread not found",
    });
  }

  const generated = await generateReplyDraft(thread._id, {
    tone,
    instruction: instruction.trim(),
  });

  const draft = await Draft.create({
    threadId: thread._id,
    createdBy: req.user._id,
    body: generated.body,
    status: "DRAFT",
    isSimulated: true,
  });

  return res.status(201).json({
    success: true,
    message: "Reply draft generated successfully",
    draft,
    draftText: draft.body,
    provider: generated.provider,
    model: generated.model,
  });
};


// POST /api/ai/chat
const chatWithInbox = async (req, res) => {
  const { question } = req.body || {};

  // Validate the user's question.
  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.trim().length > 1000
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Question must be a non-empty string of at most 1000 characters",
    });
  }

  // Derive the client from the authenticated assistant.
  const client = await getAssistantClient(req.user._id);

  if (!client) {
    return res.status(200).json({
      success: true,
      answer:
        "No client or email conversations are currently available.",
      relevantThreads: [],
      provider: null,
      model: null,
    });
  }

  // Retrieve only conversations belonging to this assistant and client.
  // Limit the context to the 20 most recently updated conversations.
  const threads = await Thread.find({
    assistantId: req.user._id,
    clientId: client._id,
  })
    .select(
      [
        "_id",
        "subject",
        "summary",
        "clientSummary",
        "currentClassification",
        "priority",
        "category",
        "actionRequired",
        "suggestedAction",
        "waitingForResponse",
        "clientStatus",
        "lastMessageAt",
        "isArchived",
        "isDone",
      ].join(" ")
    )
    .sort({ lastMessageAt: -1, _id: -1 })
    .limit(20)
    .lean();

  if (threads.length === 0) {
    return res.status(200).json({
      success: true,
      answer: "There are no email conversations available yet.",
      relevantThreads: [],
      provider: null,
      model: null,
    });
  }

  // Build compact, bounded context instead of sending entire emails.
  const chatContext = threads.map((thread) => ({
    id: thread._id.toString(),
    subject: (thread.subject || "").slice(0, 200),
    summary: (thread.summary || "").slice(0, 600),
    clientSummary: (thread.clientSummary || "").slice(0, 600),
    classification: thread.currentClassification,
    priority: thread.priority,
    category: (thread.category || "").slice(0, 100),
    actionRequired: Boolean(thread.actionRequired),
    suggestedAction: (thread.suggestedAction || "").slice(0, 300),
    waitingForResponse: Boolean(thread.waitingForResponse),
    clientStatus: thread.clientStatus,
    lastMessageAt: thread.lastMessageAt
      ? new Date(thread.lastMessageAt).toISOString()
      : null,
    isArchived: Boolean(thread.isArchived),
    isDone: Boolean(thread.isDone),
  }));

  const generated = await generateInboxChatAnswer(
    question.trim(),
    chatContext
  );

  // Only allow IDs from the conversations retrieved above.
  const allowedThreads = new Map(
    threads.map((thread) => [
      thread._id.toString(),
      thread,
    ])
  );

  const relevantThreads = generated.relevantThreadIds
    .filter((id) => allowedThreads.has(id))
    .map((id) => {
      const thread = allowedThreads.get(id);

      return {
        id: thread._id,
        subject: thread.subject,
      };
    });

  return res.status(200).json({
    success: true,
    answer: generated.answer,
    relevantThreads,
    provider: generated.provider,
    model: generated.model,
  });
};


module.exports = {
  createReplyDraft,
  chatWithInbox,
};
