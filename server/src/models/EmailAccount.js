const mongoose = require("mongoose");

const emailAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["gmail", "outlook", "demo"],
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    connectionStatus: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "connected",
    },
    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "error"],
      default: "idle",
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    isMock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailAccount", emailAccountSchema);