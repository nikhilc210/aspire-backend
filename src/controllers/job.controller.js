const Job = require("../models/job.model");

// Create a job posting
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salary,
      employmentType,
      postedBy,
      tags,
      experience,
    } = req.body;

    if (!title || !description || !company) {
      return res.status(400).json({
        success: false,
        message: "title, description and company are required",
      });
    }

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      employmentType,
      postedBy,
      tags,
      experience,
    });
    await job.save();

    return res.status(201).json({ success: true, message: "Job created", job });
  } catch (err) {
    console.error("createJob error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get jobs with optional pagination and filter by postedBy
exports.getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, postedBy, tag } = req.query;
    const q = {};
    if (postedBy) q.postedBy = postedBy;
    if (tag) q.tags = tag;

    const skip = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);
    const [jobs, total] = await Promise.all([
      Job.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Job.countDocuments(q),
    ]);

    return res.status(200).json({
      success: true,
      message: "Jobs fetched",
      jobs,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (err) {
    console.error("getJobs error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a job posting
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow these fields to be updated
    const allowed = [
      "title",
      "description",
      "company",
      "location",
      "salary",
      "employmentType",
      "tags",
      "experience",
    ];

    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No updatable fields provided" });
    }

    const job = await Job.findById(id);
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    Object.assign(job, updates);
    await job.save();

    return res.status(200).json({ success: true, message: "Job updated", job });
  } catch (err) {
    console.error("updateJob error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Block or unblock a job posting
// PATCH /api/jobs/:id/block
exports.setJobBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    if (typeof blocked !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "blocked must be boolean" });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    job.blocked = blocked;
    job.blockedAt = blocked ? new Date() : null;
    await job.save();

    return res
      .status(200)
      .json({
        success: true,
        message: `Job ${blocked ? "blocked" : "unblocked"}`,
      });
  } catch (err) {
    console.error("setJobBlockStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all jobs (no pagination)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      message: "All jobs fetched",
      jobs,
      total: jobs.length,
    });
  } catch (err) {
    console.error("getAllJobs error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
