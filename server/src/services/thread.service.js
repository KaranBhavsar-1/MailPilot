
const User = require("../models/User");

// Find the client assigned to the logged-in assistant.
const getAssistantClient = async (assistantId) => {
  return User.findOne({
    assistantId,
    role: "client",
  }).select("_id name email");
};

// Escape special regex characters in search input.
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Central segment mapping.
const getSegmentFilter = (segment) => {
  switch (segment) {
    case "all":
      return { isArchived: false };

    case "assistant":
      return {
        currentClassification: "ASSISTANT",
        isArchived: false,
      };

    case "client":
      return {
        currentClassification: "CLIENT",
        clientStatus: "PENDING",
        isArchived: false,
      };

    case "no-reply":
      return {
        currentClassification: "NO_REPLY",
        isArchived: false,
      };

    case "review":
      return {
        $or: [
          { currentClassification: "REVIEW" },
          { needsReview: true },
        ],
        isArchived: false,
      };

    case "important":
      return {
        isImportant: true,
        isArchived: false,
      };

    case "waiting":
      return {
        waitingForResponse: true,
        isArchived: false,
      };

    case "archived":
      return { isArchived: true };

    default:
      return null;
  }
};

// Build MongoDB query for the inbox.
const buildThreadQuery = ({
  assistantId,
  clientId,
  segment = "all",
  search,
  priority,
  unread,
  important,
  archived,
}) => {
  const query = {
    assistantId,
    clientId,
    ...getSegmentFilter(segment),
  };

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    query.$and = [
      {
        $or: [
          { subject: searchRegex },
          { snippet: searchRegex },
          { participants: searchRegex },
        ],
      },
    ];
  }

  if (priority) {
    query.priority = priority;
  }

  if (typeof unread === "boolean") {
    query.isUnread = unread;
  }

  if (typeof important === "boolean") {
    query.isImportant = important;
  }

  // Explicit archive filter can override the segment default.
  if (typeof archived === "boolean") {
    query.isArchived = archived;
  }

  return query;
};

module.exports = {
  getAssistantClient,
  getSegmentFilter,
  buildThreadQuery,
};
