
const Message = require("../models/Message");
const Thread = require("../models/Thread");

// Determine waiting status from the latest message.
// Latest INBOUND  = no reply has been sent yet.
// Latest OUTBOUND = waiting for the external sender.
const syncWaitingForResponse = async (threadId) => {
  const latestMessage = await Message.findOne({ threadId })
    .sort({ sentAt: -1, _id: -1 })
    .select("direction")
    .lean();

  const waitingForResponse =
    latestMessage?.direction === "OUTBOUND";

  await Thread.updateOne(
    { _id: threadId },
    { $set: { waitingForResponse } }
  );

  return waitingForResponse;
};

module.exports = {
  syncWaitingForResponse,
};
