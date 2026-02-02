const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Hash password before saving
// Use async middleware without `next` (Mongoose supports async/await middleware).
AdminSchema.pre("save", async function () {
  const admin = this;
  if (!admin.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(admin.password, salt);
  admin.password = hash;
});

// Instance method to compare password
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
