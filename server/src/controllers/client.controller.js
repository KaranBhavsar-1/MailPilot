const mongoose = require("mongoose");

const Thread = require("../models/Thread");
const Message = require("../models/Message");
const AIAnalysis = require("../models/AIAnalysis");
const Activity = require("../models/Activity");

// GET /api/client/threads
const getClientThreads = async (req, res) => {
  // The client ID always comes from the authenticated user.
  const query = {
    clientId: req.user._id,
    currentClassification: "CLIENT",
    clientStatus: "PENDING",
    isArchived: false,
    isDone: false,
  };

  const threads = await Thread.find(query)
    .sort({ lastMessageAt: -1 })
    .lean();

  const threadIds = threads.map((thread) => thread._id);

  // Fetch messages for all threads in one query.
  const messages = await Message.find({
    threadId: { $in: threadIds },
  })
    .sort({ sentAt: -1 })
    .lean();

  // Keep only the latest message for each thread.
  const latestMessages = new Map();

  for (const message of messages) {
    const id = message.threadId.toString();

    if (!latestMessages.has(id)) {
      latestMessages.set(id, message);
    }
  }

  const items = threads.map((thread) => ({
    ...thread,
    latestMessage:
      latestMessages.get(thread._id.toString()) || null,
  }));

  return res.status(200).json({
    success: true,
    items,
    total: items.length,
  });
};

// GET /api/client/threads/:id
const getClientThreadById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // A client can only access their own conversation.
  const thread = await Thread.findOne({
    _id: id,
    clientId: req.user._id,
  }).lean();

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
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

// PATCH /api/client/threads/:id/handled
const handleClientThread = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Require the conversation to still be pending for this client.
  const thread = await Thread.findOneAndUpdate(
    {
      _id: id,
      clientId: req.user._id,
      currentClassification: "CLIENT",
      clientStatus: "PENDING",
      isArchived: false,
      isDone: false,
    },
    {
      $set: {
        clientStatus: "HANDLED",
        isDone: true,
      },
    },
    // { new: true }
    { returnDocument: "after" }
  );

  if (!thread) {
    return res.status(409).json({
      success: false,
      message:
        "This conversation is no longer pending or is not available to you.",
    });
  }

  await Activity.create({
    threadId: thread._id,
    performedBy: req.user._id,
    actorRole: "client",
    action: "CLIENT_HANDLED",
    previousValue: "PENDING",
    newValue: "HANDLED",
    note: "Client marked this conversation as handled.",
  });

  return res.status(200).json({
    success: true,
    message: "Conversation marked as handled.",
    thread,
  });
};

// PATCH /api/client/threads/:id/handoff
const handoffClientThread = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Require the conversation to still be pending for this client.
  const thread = await Thread.findOne({
    _id: id,
    clientId: req.user._id,
    currentClassification: "CLIENT",
    clientStatus: "PENDING",
    isArchived: false,
    isDone: false,
  });

  if (!thread) {
    return res.status(409).json({
      success: false,
      message:
        "This conversation is no longer pending or is not available to you.",
    });
  }

  const previousClassification = thread.currentClassification;

  // Delegate the conversation back to the assistant.
  thread.currentClassification = "ASSISTANT";
  thread.clientStatus = "DELEGATED";
  thread.isDone = false;

  // Preserve this explicit human handoff if AI analysis runs again.
  thread.manuallyOverridden = true;
  thread.overrideBy = req.user._id;
  thread.overrideAt = new Date();
  thread.overrideReason = "Client delegated this conversation to the assistant.";

  await thread.save();

  await Activity.create({
    threadId: thread._id,
    performedBy: req.user._id,
    actorRole: "client",
    action: "CLIENT_DELEGATED",
    previousValue: previousClassification,
    newValue: "ASSISTANT",
    note: "Client delegated this conversation to the assistant.",
  });

  return res.status(200).json({
    success: true,
    message: "Conversation delegated to the assistant.",
    thread,
  });
};

module.exports = {
  getClientThreads,
  getClientThreadById,
  handleClientThread,
  handoffClientThread,
};