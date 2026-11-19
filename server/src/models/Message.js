const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    senderName: { type: String, required: true },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipients: [{ type: String }],
    body: { type: String, required: true },
    direction: {
      type: String,
      enum: ["INBOUND", "OUTBOUND"],
      required: true,
    },
    sentAt: { type: Date, default: Date.now },
    isSimulated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

messageSchema.index({ threadId: 1, sentAt: 1 });

module.exports = mongoose.model("Message", messageSchema);