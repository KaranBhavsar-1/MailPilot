
const EmailAccount = require("../models/EmailAccount");
const Thread = require("../models/Thread");
const User = require("../models/User");

// GET /api/accounts
const getAccounts = async (req, res) => {
  const accounts = await EmailAccount.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    accounts,
  });
};

// POST /api/accounts/connect
const connectAccount = async (req, res) => {
  const { provider } = req.body;

  if (!["gmail", "outlook"].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: "Provider must be gmail or outlook",
    });
  }

  // Find the client assigned to this assistant.
  const client = await User.findOne({
    assistantId: req.user._id,
    role: "client",
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "No client is assigned to this assistant",
    });
  }

  // Avoid creating duplicate active demo accounts.
  const existingAccount = await EmailAccount.findOne({
    userId: req.user._id,
    clientId: client._id,
    provider,
    connectionStatus: "connected",
  });

  if (existingAccount) {
    return res.status(200).json({
      success: true,
      simulated: true,
      message: "Demo account is already connected",
      account: existingAccount,
    });
  }

  const demoEmail =
    provider === "gmail"
      ? "alex.morgan.demo@gmail.com"
      : "alex.morgan.demo@outlook.com";

  const account = await EmailAccount.create({
    userId: req.user._id,
    clientId: client._id,
    provider,
    emailAddress: demoEmail,
    connectionStatus: "connected",
    syncStatus: "idle",
    isMock: true,
  });

  res.status(201).json({
    success: true,
    simulated: true,
    message: "Demo account connected successfully",
    account,
  });
};

// POST /api/accounts/:id/sync
const syncAccount = async (req, res) => {
  const account = await EmailAccount.findOne({
    _id: req.params.id,
    userId: req.user._id,
    connectionStatus: "connected",
    isMock: true,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Connected demo account not found",
    });
  }

  const validClient = await User.exists({
    _id: account.clientId,
    assistantId: req.user._id,
    role: "client",
  });

  if (!validClient) {
    return res.status(403).json({
      success: false,
      message: "You cannot sync an account for this client",
    });
  }

  account.syncStatus = "syncing";
  await account.save();

  try {
    // Import the assistant's seeded conversations into this account.
    // This prototype supports one assigned client per assistant.
    const result = await Thread.updateMany(
      {
        assistantId: req.user._id,
        clientId: account.clientId,
        $or: [
          { emailAccountId: { $exists: false } },
          { emailAccountId: { $ne: account._id } },
        ],
      },
      {
        $set: { emailAccountId: account._id },
      }
    );

    const importedConversations = result.modifiedCount;

    account.syncStatus = "idle";
    account.lastSyncedAt = new Date();
    await account.save();

    // Count all conversations now associated with this account.
    const totalConversations = await Thread.countDocuments({
      assistantId: req.user._id,
      clientId: account.clientId,
      emailAccountId: account._id,
    });

    return res.status(200).json({
      success: true,
      simulated: true,
      message: "Demo sync completed",
      importedConversations,
      totalConversations,
      account,
    });
  } catch (error) {
    account.syncStatus = "error";
    await account.save();
    throw error;
  }
};

// PATCH /api/accounts/:id/disconnect
const disconnectAccount = async (req, res) => {
  const account = await EmailAccount.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  }

  account.connectionStatus = "disconnected";
  account.syncStatus = "idle";
  await account.save();

  res.status(200).json({
    success: true,
    message: "Demo account disconnected",
    account,
  });
};

module.exports = {
  getAccounts,
  connectAccount,
  syncAccount,
  disconnectAccount,
};
