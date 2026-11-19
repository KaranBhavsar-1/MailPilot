const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      enum: ["assistant", "client"],
      required: true,
    },
    action: { type: String, required: true },
    previousValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);