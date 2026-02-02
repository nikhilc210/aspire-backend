const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    salary: { type: String, trim: true },
    employmentType: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    experience: { type: String, trim: true },
    blocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", JobSchema);
