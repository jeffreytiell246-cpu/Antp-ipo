import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { profileWithAdmin } from "../utils/admin.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: profileWithAdmin(req.user) });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const allowedUpdates = ["name", "brokerageName", "brokerageAccountNumber", "bio", "avatarUrl"];

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        req.user[field] = typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    }

    await req.user.save();
    return res.json({ user: profileWithAdmin(req.user) });
  } catch (error) {
    next(error);
  }
});

export default router;
