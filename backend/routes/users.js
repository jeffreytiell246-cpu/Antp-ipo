import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import { isAdminUser, profileWithAdmin } from "../utils/admin.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET;
  const suppliedSecret = req.get("x-admin-secret");

  if (!adminSecret) {
    return res.status(500).json({ message: "Admin access is not configured." });
  }

  if (!isAdminUser(req.user)) {
    return res.status(403).json({ message: "Admin access is required." });
  }

  if (suppliedSecret !== adminSecret) {
    return res.status(401).json({ message: "Invalid admin key." });
  }

  next();
}

router.get("/admin", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ users: users.map((user) => profileWithAdmin(user)) });
  } catch (error) {
    next(error);
  }
});

export default router;
