const mongoose = require("mongoose");

const CLASSIFICATIONS = ["ASSISTANT", "CLIENT", "NO_REPLY", "REVIEW"];

const threadSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assistantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emailAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailAccount",
      required: true,
    },

    subject: { type: String, required: true },
    participants: [{ type: String }],
    snippet: { type: String, default: "" },

    aiClassification: {
      type: String,
      enum: CLASSIFICATIONS,
      default: "REVIEW",
    },
    currentClassification: {
      type: String,
      enum: CLASSIFICATIONS,
      default: "REVIEW",
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    reason: { type: String, default: "" },
    summary: { type: String, default: "" },
    clientSummary: { type: String, default: "" },
    suggestedAction: { type: String, default: "" },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    category: { type: String, default: "General" },
    actionRequired: { type: Boolean, default: false },
    waitingForResponse: { type: Boolean, default: false },
    needsReview: { type: Boolean, default: false },

    manuallyOverridden: { type: Boolean, default: false },
    overrideBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    overrideAt: { type: Date, default: null },
    overrideReason: { type: String, default: "" },

    clientStatus: {
      type: String,
      enum: ["PENDING", "HANDLED", "DELEGATED", "NOT_REQUIRED"],
      default: "NOT_REQUIRED",
    },

    isImportant: { type: Boolean, default: false },
    isUnread: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    isDone: { type: Boolean, default: false },

    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

threadSchema.index({ clientId: 1, currentClassification: 1 });
threadSchema.index({ assistantId: 1, currentClassification: 1 });
threadSchema.index({ lastMessageAt: -1 });
threadSchema.index({
  clientStatus: 1,
  isArchived: 1,
  isImportant: 1,
});

module.exports = mongoose.model("Thread", threadSchema);