const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");

// Create an admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, fullname, location } = req.body;

    if (!email || !password || !fullname) {
      return res.status(400).json({
        success: false,
        message: "email, password and fullname are required",
      });
    }

    // Check existing
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const admin = new Admin({ email, password, fullname, location });
    await admin.save();

    // Exclude password from response
    const adminObj = admin.toObject();
    delete adminObj.password;

    return res
      .status(201)
      .json({ success: true, message: "Admin created", admin: adminObj });
  } catch (err) {
    console.error("createAdmin error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all admins (exclude password)
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }).sort({
      createdAt: -1,
    });
    return res
      .status(200)
      .json({ success: true, message: "Admins fetched", admins });
  } catch (err) {
    console.error("getAdmins error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update admin password
// PATCH /api/admins/:id/password
exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "oldPassword and newPassword are required",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const match = await admin.comparePassword(oldPassword);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Set new password; pre-save hook will hash it
    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("updatePassword error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Block or unblock an admin
// PATCH /api/admins/:id/block
exports.setBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    if (typeof blocked !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "blocked must be boolean" });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    admin.blocked = blocked;
    admin.blockedAt = blocked ? new Date() : null;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: `Admin ${blocked ? "blocked" : "unblocked"}`,
    });
  } catch (err) {
    console.error("setBlockStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin login
// POST /api/admins/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (admin.blocked) {
      return res
        .status(403)
        .json({ success: false, message: "Admin is blocked" });
    }

    const match = await admin.comparePassword(password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "change_this_secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const payload = {
      id: admin._id,
      email: admin.email,
      fullname: admin.fullname,
      role: "admin",
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    const adminObj = admin.toObject();
    delete adminObj.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: adminObj,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
