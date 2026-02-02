const path = require("path");
const fs = require("fs").promises;

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

exports.uploadFile = async (req, res) => {
  try {
    const files = req.files || [];
    const result = files.map((f) => ({
      originalName: f.originalname,
      filename: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      path: f.path,
      url: `/uploads/${f.filename}`,
    }));

    return res
      .status(201)
      .json({ success: true, message: "Files uploaded", files: result });
  } catch (err) {
    console.error("uploadFile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.listFiles = async (req, res) => {
  try {
    await fs.access(UPLOAD_DIR);
    const files = await fs.readdir(UPLOAD_DIR);
    const stats = await Promise.all(
      files.map(async (name) => {
        const filePath = path.join(UPLOAD_DIR, name);
        const st = await fs.stat(filePath);
        return {
          filename: name,
          size: st.size,
          createdAt: st.ctime,
          updatedAt: st.mtime,
          url: `/uploads/${name}`,
        };
      }),
    );

    return res
      .status(200)
      .json({ success: true, message: "Files listed", files: stats });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res
        .status(200)
        .json({ success: true, message: "Files listed", files: [] });
    }
    console.error("listFiles error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);
    // basic existence check
    await fs.access(filePath);
    return res.sendFile(filePath);
  } catch (err) {
    if (err.code === "ENOENT")
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    console.error("getFile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
