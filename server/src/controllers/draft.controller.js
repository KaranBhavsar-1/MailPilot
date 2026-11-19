
const mongoose = require("mongoose");

const Draft = require("../models/Draft");
const Thread = require("../models/Thread");
const Message = require("../models/Message");
const Activity = require("../models/Activity");
const User = require("../models/User");

const { getAssistantClient } = require("../services/thread.service");
const { generateReplyDraft } = require("../services/ai.service");

const {
  syncWaitingForResponse,
} = require("../services/waiting-status.service");

const ALLOWED_TONES = [
  "professional",
  "friendly",
  "formal",
  "concise",
  "empathetic",
];

// Find a draft and verify that it belongs to the authenticated assistant.
const findOwnedDraft = async (draftId, assistantId, clientId) => {
  if (!mongoose.Types.ObjectId.isValid(draftId)) {
    const error = new Error("Invalid draft ID");
    error.statusCode = 400;
    throw error;
  }

  const draft = await Draft.findOne({
    _id: draftId,
    createdBy: assistantId,
  });

  if (!draft) {
    const error = new Error("Draft not found");
    error.statusCode = 404;
    throw error;
  }

  const thread = await Thread.findOne({
    _id: draft.threadId,
    assistantId,
    clientId,
  });

  if (!thread) {
    const error = new Error("You do not have access to this draft");
    error.statusCode = 403;
    throw error;
  }

  return { draft, thread };
};

// Get the assistant's client.
const getAssistantClientForRequest = async (assistantId) => {
  const client = await getAssistantClient(assistantId);

  if (!client) {
    const error = new Error("No client is linked to this assistant");
    error.statusCode = 404;
    throw error;
  }

  return client;
};

// Update an existing draft.
const updateDraft = async (req, res) => {
  const { body } = req.body;

  if (typeof body !== "string" || !body.trim()) {
    return res.status(400).json({
      success: false,
      message: "Draft body is required",
    });
  }

  if (body.length > 10000) {
    return res.status(400).json({
      success: false,
      message: "Draft cannot exceed 10,000 characters",
    });
  }

  const client = await getAssistantClientForRequest(req.user._id);

  const { draft } = await findOwnedDraft(
    req.params.id,
    req.user._id,
    client._id
  );

  if (draft.status !== "DRAFT") {
    return res.status(400).json({
      success: false,
      message: "Only drafts can be edited",
    });
  }

  draft.body = body.trim();
  await draft.save();

  return res.status(200).json({
    success: true,
    message: "Draft updated successfully",
    draft,
  });
};

// Regenerate an existing draft using AI.
const regenerateDraft = async (req, res) => {
  const { tone = "professional", instruction = "" } = req.body;

  if (!ALLOWED_TONES.includes(tone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tone",
    });
  }

  if (typeof instruction !== "string" || instruction.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Instruction must be a string of at most 500 characters",
    });
  }

  const client = await getAssistantClientForRequest(req.user._id);

  const { draft, thread } = await findOwnedDraft(
    req.params.id,
    req.user._id,
    client._id
  );

  if (draft.status !== "DRAFT") {
    return res.status(400).json({
      success: false,
      message: "Only active drafts can be regenerated",
    });
  }

  const result = await generateReplyDraft(thread._id, {
    tone,
    instruction: instruction.trim(),
  });

  draft.body = result.body;
  await draft.save();

  return res.status(200).json({
    success: true,
    message: "Draft regenerated successfully",
    draft,
    draftText: result.body,
    provider: result.provider,
    model: result.model,
  });
};

// Discard a draft.
const discardDraft = async (req, res) => {
  const client = await getAssistantClientForRequest(req.user._id);

  const { draft } = await findOwnedDraft(
    req.params.id,
    req.user._id,
    client._id
  );

  if (draft.status !== "DRAFT") {
    return res.status(400).json({
      success: false,
      message: "Only active drafts can be discarded",
    });
  }

  draft.status = "DISCARDED";
  await draft.save();

  return res.status(200).json({
    success: true,
    message: "Draft discarded successfully",
    draft,
  });
};

// Approve a draft and add it to the demo conversation.
// This does NOT send an actual email.
const approveSimulatedSend = async (req, res) => {
  const client = await getAssistantClientForRequest(req.user._id);

  const { draft, thread } = await findOwnedDraft(
    req.params.id,
    req.user._id,
    client._id
  );

  if (draft.status !== "DRAFT") {
    return res.status(400).json({
      success: false,
      message: "This draft has already been processed",
    });
  }

  // Atomically approve the draft to prevent duplicate approvals.
  const approvedDraft = await Draft.findOneAndUpdate(
    {
      _id: draft._id,
      createdBy: req.user._id,
      status: "DRAFT",
    },
    {
      $set: {
        status: "SIMULATED_SENT",
        isSimulated: true,
      },
    },
    // { new: true }
    { returnDocument: "after" }
  );

  if (!approvedDraft) {
    return res.status(409).json({
      success: false,
      message: "This draft has already been processed",
    });
  }

  const assistant = await User.findById(req.user._id).select("name email");

  if (!assistant) {
    await Draft.findByIdAndUpdate(draft._id, {
      $set: { status: "DRAFT" },
    });

    return res.status(404).json({
      success: false,
      message: "Assistant account not found",
    });
  }

  const recipients = (thread.participants || []).filter(
    (email) => email.toLowerCase() !== assistant.email.toLowerCase()
  );

  const originalSnippet = thread.snippet;
  const originalLastMessageAt = thread.lastMessageAt;

  let createdMessage = null;
  let createdActivity = null;

  try {
    // Add an outbound message to the conversation.
    createdMessage = await Message.create({
      threadId: thread._id,
      senderName: assistant.name,
      senderEmail: assistant.email,
      recipients,
      body: approvedDraft.body,
      direction: "OUTBOUND",
      sentAt: new Date(),
      isSimulated: true,
    });

    // Update the conversation preview and latest-message time.
    // thread.snippet = approvedDraft.body.slice(0, 180);
    // thread.lastMessageAt = createdMessage.sentAt;

    // await thread.save();

thread.snippet = approvedDraft.body.slice(0, 180);
thread.lastMessageAt = createdMessage.sentAt;

await thread.save();

// The latest message is now OUTBOUND, so mark the thread as waiting.
await syncWaitingForResponse(thread._id);

    // Record the approval in the activity timeline.
    createdActivity = await Activity.create({
      threadId: thread._id,
      performedBy: req.user._id,
      actorRole: "assistant",
      action: "DRAFT_SIMULATED_SENT",
      previousValue: "DRAFT",
      newValue: "SIMULATED_SENT",
      note: "Assistant approved a simulated reply. No external email was sent.",
    });

    return res.status(200).json({
      success: true,
      message: "Added to demo conversation. No external email was sent.",
      draft: approvedDraft,
      messageRecord: createdMessage,
    });
  } catch (error) {
    // Roll back partial changes if any step fails.
    const rollbackTasks = [];

    if (createdActivity) {
      rollbackTasks.push(
        Activity.findByIdAndDelete(createdActivity._id)
      );
    }

    if (createdMessage) {
      rollbackTasks.push(
        Message.findByIdAndDelete(createdMessage._id)
      );

      // Restore thread preview only if it still points to our message.
      rollbackTasks.push(
        Thread.updateOne(
          {
            _id: thread._id,
            lastMessageAt: createdMessage.sentAt,
          },
          {
            $set: {
              snippet: originalSnippet,
              lastMessageAt: originalLastMessageAt,
            },
          }
        )
      );
    }

    rollbackTasks.push(
      Draft.findByIdAndUpdate(draft._id, {
        $set: { status: "DRAFT" },
      })
    );

    await Promise.allSettled(rollbackTasks);

// Recalculate status after a possible message rollback.
if (createdMessage) {
  try {
    await syncWaitingForResponse(thread._id);
  } catch (rollbackError) {
    console.error(
      "[MailPilot] Failed to restore waiting status:",
      rollbackError.message
    );
  }
}

throw error;
  }
};

module.exports = {
  updateDraft,
  regenerateDraft,
  discardDraft,
  approveSimulatedSend,
};
