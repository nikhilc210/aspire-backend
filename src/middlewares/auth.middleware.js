const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

/**
 * Auth middleware - verifies JWT and attaches admin to req.admin
 * Expects Authorization: Bearer <token>
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "change_this_secret";

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (admin.blocked) {
      return res
        .status(403)
        .json({ success: false, message: "Admin is blocked" });
    }

    req.admin = admin;
    return next();
  } catch (err) {
    console.error("auth middleware error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
