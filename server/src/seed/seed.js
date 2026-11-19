require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");

const User = require("../models/User");
const EmailAccount = require("../models/EmailAccount");
const Thread = require("../models/Thread");
const Message = require("../models/Message");
const AIAnalysis = require("../models/AIAnalysis");
const Draft = require("../models/Draft");
const Activity = require("../models/Activity");

const sampleData = require("./sample-data");

const DEMO_PASSWORD = "MailPilotDemo123!";

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    console.log("Starting MailPilot demo seed...");

    // 2. Find existing demo users
    const demoEmails = [
      "assistant@demo.mailpilot.test",
      "client@demo.mailpilot.test",
    ];

    const existingUsers = await User.find({
      email: { $in: demoEmails },
    });

    const existingUserIds = existingUsers.map((user) => user._id);

    // 3. Find only threads and accounts belonging to demo users
    const existingThreads = await Thread.find({
      $or: [
        { clientId: { $in: existingUserIds } },
        { assistantId: { $in: existingUserIds } },
      ],
    }).select("_id");

    const threadIds = existingThreads.map((thread) => thread._id);

    // 4. Remove dependent demo records first
    if (threadIds.length > 0) {
      await Message.deleteMany({ threadId: { $in: threadIds } });
      await AIAnalysis.deleteMany({ threadId: { $in: threadIds } });
      await Draft.deleteMany({ threadId: { $in: threadIds } });
      await Activity.deleteMany({ threadId: { $in: threadIds } });
      await Thread.deleteMany({ _id: { $in: threadIds } });
    }

    if (existingUserIds.length > 0) {
      await EmailAccount.deleteMany({
        $or: [
          { userId: { $in: existingUserIds } },
          { clientId: { $in: existingUserIds } },
        ],
      });
    }

    // Delete only these exact demo users
    await User.deleteMany({ email: { $in: demoEmails } });

    console.log("Previous demo records cleaned.");

    // 5. Hash demo password
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    // 6. Create assistant
    const assistant = await User.create({
      name: "Alex Morgan",
      email: "assistant@demo.mailpilot.test",
      passwordHash,
      role: "assistant",
    });

    // 7. Create client and link to assistant
    const client = await User.create({
      name: "Priya Mehta",
      email: "client@demo.mailpilot.test",
      passwordHash,
      role: "client",
      assistantId: assistant._id,
    });

    console.log("Demo users created.");

    // 8. Create simulated Gmail account
    const emailAccount = await EmailAccount.create({
      userId: assistant._id,
      clientId: client._id,
      provider: "gmail",
      emailAddress: "priya@demo.mailpilot.test",
      connectionStatus: "connected",
      syncStatus: "idle",
      lastSyncedAt: new Date(),
      isMock: true,
    });

    console.log("Demo email account created.");

    // 9. Create threads, messages and AI analysis
    for (let i = 0; i < sampleData.length; i++) {
      const item = sampleData[i];

      const messageDate = new Date(
        Date.now() - i * 60 * 60 * 1000
      );

      const thread = await Thread.create({
        clientId: client._id,
        assistantId: assistant._id,
        emailAccountId: emailAccount._id,

        subject: item.subject,
        participants: [
          item.senderEmail,
          "priya@demo.mailpilot.test",
        ],
        snippet: item.body.slice(0, 120),

        aiClassification: item.classification,
        currentClassification: item.classification,
        confidence: item.confidence,
        reason: item.reason,
        summary: item.summary,
        clientSummary: item.clientSummary,
        suggestedAction: item.suggestedAction,

        priority: item.priority,
        category: item.category,
        actionRequired: item.actionRequired,
        waitingForResponse: false,
        needsReview: item.classification === "REVIEW",

        clientStatus: item.clientStatus,

        isImportant: item.isImportant,
        isUnread: item.isUnread,
        isArchived: i === 8,
        isDone: i === 10,

        lastMessageAt: messageDate,
      });

      // Incoming email
      await Message.create({
        threadId: thread._id,
        senderName: item.senderName,
        senderEmail: item.senderEmail,
        recipients: ["priya@demo.mailpilot.test"],
        body: item.body,
        direction: "INBOUND",
        sentAt: messageDate,
        isSimulated: true,
      });

      // Add a second message to selected conversations
      if (i % 3 === 0) {
        const replyDate = new Date(
          messageDate.getTime() + 10 * 60 * 1000
        );

        await Message.create({
          threadId: thread._id,
          senderName: "Priya Mehta",
          senderEmail: "priya@demo.mailpilot.test",
          recipients: [item.senderEmail],
          body: "Thank you for the update. I will review this.",
          direction: "OUTBOUND",
          sentAt: replyDate,
          isSimulated: true,
        });
      }

      // Save a historical AI analysis
      await AIAnalysis.create({
        threadId: thread._id,
        classification: item.classification,
        confidence: item.confidence,
        summary: item.summary,
        clientSummary: item.clientSummary,
        reason: item.reason,
        actionRequired: item.actionRequired,
        priority: item.priority,
        category: item.category,
        suggestedAction: item.suggestedAction,
        waitingForResponse: false,
        provider: "seed",
        model: "sample-data",
        status: "SUCCESS",
        analyzedAt: messageDate,
      });

      // Add an activity record
      await Activity.create({
        threadId: thread._id,
        performedBy: assistant._id,
        actorRole: "assistant",
        action: "DEMO_THREAD_CREATED",
        note: "Conversation created by the demo seed script.",
      });

      // Add draft examples for a few conversations
      if (item.reply && i < 2) {
        await Draft.create({
          threadId: thread._id,
          createdBy: assistant._id,
          body: item.reply,
          status: "DRAFT",
          isSimulated: true,
        });
      }
    }

    console.log("Demo threads, messages and AI analyses created.");

    // 10. Print demo login details
    console.log("\n========== MAILPILOT DEMO LOGIN ==========");
    console.log("Assistant: assistant@demo.mailpilot.test");
    console.log("Client:    client@demo.mailpilot.test");
    console.log(`Password:  ${DEMO_PASSWORD}`);
    console.log("==========================================\n");

    console.log("MailPilot database seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    // 11. Close database connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedDatabase();