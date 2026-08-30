import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isAdminEmail, profileWithAdmin } from "../utils/admin.js";
import { clearRefreshCookie, createAccessToken, createRefreshToken, setRefreshCookie } from "../utils/tokens.js";

const router = express.Router();

function authPayload(user) {
  return {
    user: profileWithAdmin(user),
    accessToken: createAccessToken(user._id.toString()),
  };
}

router.post("/signup", async (req, res, next) => {
  try {
    const { brokerageName, name, email, password } = req.body || {};

    if (!name || !brokerageName || !email || !password) {
      return res.status(400).json({ message: "Full name, brokerage name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      brokerageName: brokerageName.trim(),
      passwordHash,
      role: isAdminEmail(normalizedEmail) ? "admin" : "user",
    });

    const refreshToken = createRefreshToken(user._id.toString());
    setRefreshCookie(res, refreshToken);

    return res.status(201).json(authPayload(user));
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const refreshToken = createRefreshToken(user._id.toString());
    setRefreshCookie(res, refreshToken);

    return res.json(authPayload(user));
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token." });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "User no longer exists." });
    }

    return res.json(authPayload(user));
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid or expired refresh token." });
  }
});

router.post("/logout", (req, res) => {
  clearRefreshCookie(res);
  return res.json({ message: "Logged out." });
});

export default router;
