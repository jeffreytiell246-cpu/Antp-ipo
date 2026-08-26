import express from "express";
import { requireAuth } from "../middleware/auth.js";
import PaymentRequest from "../models/PaymentRequest.js";
import { isAdminUser } from "../utils/admin.js";

const router = express.Router();
const allowedStatuses = new Set(["pending_review", "approved", "rejected"]);

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

function cleanString(value) {
  return String(value || "").trim();
}

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const requests = await PaymentRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ requests: requests.map((request) => request.toRecord()) });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      amountUsd,
      cryptoDue,
      destinationAddress,
      estimatedShares,
      network,
      paymentAsset,
      proofImage = "",
      receivingWallet = "",
      senderWallet = "",
      txHash,
    } = req.body || {};

    const cleanAsset = cleanString(paymentAsset).toUpperCase();
    const cleanNetwork = cleanString(network);
    const cleanDestinationAddress = cleanString(destinationAddress);
    const cleanReceivingWallet = cleanString(receivingWallet);
    const cleanSenderWallet = cleanString(senderWallet);
    const cleanTxHash = cleanString(txHash);
    const numericAmount = Number(amountUsd);
    const numericCryptoDue = Number(cryptoDue);
    const numericEstimatedShares = Number(estimatedShares);

    if (!cleanAsset || !cleanNetwork || !cleanDestinationAddress || !cleanTxHash) {
      return res.status(400).json({ message: "Payment method, network, destination wallet, and transaction hash are required." });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid purchase amount." });
    }

    if (!Number.isFinite(numericCryptoDue) || numericCryptoDue <= 0) {
      return res.status(400).json({ message: "Enter a valid crypto payment amount." });
    }

    if (!Number.isFinite(numericEstimatedShares) || numericEstimatedShares < 0) {
      return res.status(400).json({ message: "Enter a valid ANTP estimate." });
    }

    const request = await PaymentRequest.create({
      user: req.user._id,
      amountUsd: numericAmount,
      estimatedShares: Math.floor(numericEstimatedShares),
      paymentAsset: cleanAsset,
      network: cleanNetwork,
      cryptoDue: numericCryptoDue,
      destinationAddress: cleanDestinationAddress,
      receivingWallet: cleanReceivingWallet,
      senderWallet: cleanSenderWallet,
      txHash: cleanTxHash,
      proofImage,
    });

    return res.status(201).json({ request: request.toRecord() });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "That transaction hash has already been submitted for this network." });
    }

    next(error);
  }
});

router.get("/admin", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const requests = await PaymentRequest.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ requests: requests.map((request) => request.toRecord()) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, reviewNote = "" } = req.body || {};

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ message: "Status must be pending_review, approved, or rejected." });
    }

    const request = await PaymentRequest.findById(req.params.id).populate("user");

    if (!request) {
      return res.status(404).json({ message: "Payment request not found." });
    }

    request.status = status;
    request.reviewNote = cleanString(reviewNote);
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    return res.json({ request: request.toRecord() });
  } catch (error) {
    next(error);
  }
});

export default router;
