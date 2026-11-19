const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    classification: {
      type: String,
      enum: ["ASSISTANT", "CLIENT", "NO_REPLY", "REVIEW"],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    summary: { type: String, default: "" },
    clientSummary: { type: String, default: "" },
    reason: { type: String, default: "" },
    actionRequired: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    category: { type: String, default: "General" },
    suggestedAction: { type: String, default: "" },
    waitingForResponse: { type: Boolean, default: false },
    extractedDates: [
      {
        label: String,
        dateTime: Date,
        timezone: String,
      },
    ],
    provider: { type: String, default: "seed" },
    model: { type: String, default: "sample-data" },
    status: {
      type: String,
      enum: ["SUCCESS", "FALLBACK", "ERROR"],
      default: "SUCCESS",
    },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

aiAnalysisSchema.index({ threadId: 1, analyzedAt: -1 });

module.exports = mongoose.model("AIAnalysis", aiAnalysisSchema);