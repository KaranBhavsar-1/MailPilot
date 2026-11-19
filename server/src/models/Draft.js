const mongoose = require("mongoose");

const draftSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "SIMULATED_SENT", "DISCARDED"],
      default: "DRAFT",
    },
    isSimulated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Draft", draftSchema);