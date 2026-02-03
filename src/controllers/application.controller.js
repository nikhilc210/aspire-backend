const path = require("path");
const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Job = require("../models/job.model");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id || null;
    const { fullname, email, company, phone, service, message } =
      req.body || {};

    if (!fullname || !email) {
      return res
        .status(400)
        .json({ success: false, message: "fullname and email are required" });
    }

    const files = req.files || {};

    // resume: single file
    let resumeUrl = null;
    if (files.resume && files.resume.length > 0) {
      const r = files.resume[0];
      resumeUrl = `/uploads/${r.filename}`;
    }

    // images: array
    const images = (files.images || []).map((f) => ({
      filename: f.filename,
      url: `/uploads/${f.filename}`,
      mimeType: f.mimetype,
      size: f.size,
    }));

    const application = new Application({
      job: jobId,
      fullname,
      email,
      company,
      phone,
      service,
      message,
      resumeUrl,
      images,
    });

    await application.save();

    return res
      .status(201)
      .json({ success: true, message: "Application submitted", application });
  } catch (err) {
    console.error("applyForJob error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all applications (optional pagination), include job details
// GET /api/applications?Page=&limit=
exports.getAllApplications = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "50", 10), 1);
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find({})
        .populate({ path: "job" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      message: "Applications fetched",
      applications,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("getAllApplications error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get applied jobs for a user, grouped by job with applicants array
// GET /api/applications/by-user?email=foo@example.com
exports.getApplicationsByUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "email query param is required" });
    }

    // Pull that user's applications with joined job, limit exposed fields
    const apps = await Application.find({ email })
      .populate({
        path: "job",
        select:
          "title company location employmentType experience tags createdAt",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Group by job
    const byJob = new Map();
    for (const a of apps) {
      const job = a.job || null;
      const jobId = job?._id?.toString() || "unknown";

      // Shape applicant fields (hide internal IDs except _id)
      const applicant = {
        _id: a._id,
        fullname: a.fullname,
        email: a.email,
        company: a.company,
        phone: a.phone,
        service: a.service,
        message: a.message,
        resumeUrl: a.resumeUrl,
        images: a.images,
        createdAt: a.createdAt,
      };

      if (!byJob.has(jobId)) {
        const jobInfo = job
          ? {
              _id: job._id,
              title: job.title,
              company: job.company,
              location: job.location,
              employmentType: job.employmentType,
              experience: job.experience,
              tags: job.tags || [],
              createdAt: job.createdAt,
            }
          : null;
        byJob.set(jobId, { job: jobInfo, applicants: [] });
      }
      byJob.get(jobId).applicants.push(applicant);
    }

    const results = Array.from(byJob.values());

    return res.status(200).json({
      success: true,
      message: "Applied jobs grouped by job",
      results,
      totalJobs: results.length,
      totalApplications: apps.length,
    });
  } catch (err) {
    console.error("getApplicationsByUser error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get applications from Applications collection for a given job id,
// and include that job's details on each application (populate job)
// GET /api/applications/by-job/:id
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid job id" });
    }
    // Ensure the job exists
    const exists = await Job.exists({ _id: id });
    if (!exists) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Fetch applications filtered by job and populate job fields on each row
    const applications = await Application.find({ job: id })
      .populate({
        path: "job",
        select:
          "title company location employmentType experience tags createdAt",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Applications fetched for job",
      applications,
      total: applications.length,
    });
  } catch (err) {
    console.error("getApplicationsByJob error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
