// in controllers/securityController.js
import File from "../models/File.js";

export const getSecurityOverview = async (req, res) => {
  try {
    const totalFiles = await File.countDocuments({ user: req.user._id });
    const encryptedFiles = await File.countDocuments({
      user: req.user._id,
      encryptionType: { $ne: "NONE" },
    });

    const percentageEncrypted = totalFiles > 0 
      ? ((encryptedFiles / totalFiles) * 100).toFixed(2) 
      : 0;

    res.json({
      success: true,
      lastLogin: req.user.lastLogin,  // you can track this in User schema
      storageUsed: req.user.storageUsed,
      storageLimit: req.user.storageLimit,
      encryptionCoverage: `${percentageEncrypted}% of files encrypted`,
      safe: encryptedFiles === totalFiles, // simple "green check" flag
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve security overview" });
  }
};
