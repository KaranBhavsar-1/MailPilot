const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

// Security headers
app.use(helmet());

// Parse JSON request bodies (maximum 1 MB)
app.use(express.json({ limit: "1mb" }));

// Allow requests from frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MailPilot API is running",
  });
});

// Mount other routes here as you create them
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/test", require("./routes/test.routes"));
app.use("/api/accounts", require("./routes/account.routes"));
app.use("/api/threads", require("./routes/thread.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/drafts", require("./routes/draft.routes"));
// Example:
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/threads", require("./routes/thread.routes"));

// Not-found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Central error handler (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;