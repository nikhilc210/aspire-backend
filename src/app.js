const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  // Send a single response. Using both res.send and res.json back-to-back
  // causes "ERR_HTTP_HEADERS_SENT" (no output in browser and server error).
  return res.json({ success: true, message: "API is running" });
});

// routes
// app.use("/api/users", require("./routes/user.routes"));
// Admin routes
app.use("/api/admins", require("./routes/admin.routes"));
// Application routes (apply for a job)
app.use("/api/jobs", require("./routes/application.routes"));

// Job routes
app.use("/api/jobs", require("./routes/job.routes"));
// Contact routes
app.use("/api/contacts", require("./routes/contact.routes"));

// Upload routes
app.use("/api/uploads", require("./routes/upload.routes"));

// Convenience route: fetch all jobs (mount at app level to ensure matching)
app.get("/api/jobs/all", (req, res) => {
  // require here to avoid circular dependency during module load
  const { getAllJobs } = require("./controllers/job.controller");
  return getAllJobs(req, res);
});

module.exports = app;
