import express from "express";
import { requireAuth } from "../middleware/auth.js";
import PaymentRequest from "../models/PaymentRequest.js";
import SellRequest from "../models/SellRequest.js";
import { isAdminUser } from "../utils/admin.js";

const router = express.Router();
const allowedStatuses = new Set(["pending_review", "approved", "rejected", "paid"]);
const committedSellStatuses = ["pending_review", "approved", "paid"];

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

async function getShareBalance(userId) {
  const [purchaseTotals] = await PaymentRequest.aggregate([
    { $match: { user: userId, status: "approved" } },
    { $group: { _id: null, shares: { $sum: "$estimatedShares" } } },
  ]);
  const [sellTotals] = await SellRequest.aggregate([
    { $match: { user: userId, status: { $in: committedSellStatuses } } },
    { $group: { _id: null, shares: { $sum: "$shares" } } },
  ]);

  const approvedShares = purchaseTotals?.shares || 0;
  const committedSellShares = sellTotals?.shares || 0;

  return {
    approvedShares,
    committedSellShares,
    availableShares: Math.max(approvedShares - committedSellShares, 0),
  };
}

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [requests, balance] = await Promise.all([
      SellRequest.find({ user: req.user._id }).sort({ createdAt: -1 }),
      getShareBalance(req.user._id),
    ]);

    return res.json({
      balance,
      requests: requests.map((request) => request.toRecord()),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      bankDetails = "",
      brokerageAccountNumber = "",
      brokerageName = "",
      note = "",
      payoutAddress = "",
      payoutAsset = "",
      payoutMethod,
      payoutNetwork = "",
      shares,
    } = req.body || {};

    const cleanPayoutMethod = cleanString(payoutMethod || "brokerage_account");
    const cleanBrokerageName = cleanString(brokerageName);
    const cleanBrokerageAccountNumber = cleanString(brokerageAccountNumber);
    const cleanPayoutAsset = cleanString(payoutAsset).toUpperCase();
    const cleanPayoutNetwork = cleanString(payoutNetwork);
    const cleanPayoutAddress = cleanString(payoutAddress);
    const cleanBankDetails = cleanString(bankDetails);
    const numericShares = Math.floor(Number(shares));

    if (!Number.isFinite(numericShares) || numericShares <= 0) {
      return res.status(400).json({ message: "Enter a valid ANTP amount to sell." });
    }

    if (!["brokerage_account", "crypto", "bank"].includes(cleanPayoutMethod)) {
      return res.status(400).json({ message: "Choose a valid payout method." });
    }

    if (cleanPayoutMethod === "brokerage_account" && (!cleanBrokerageName || !cleanBrokerageAccountNumber)) {
      return res.status(400).json({ message: "Brokerage name and brokerage account are required." });
    }

    if (cleanPayoutMethod === "crypto" && (!cleanPayoutAsset || !cleanPayoutNetwork || !cleanPayoutAddress)) {
      return res.status(400).json({ message: "Crypto payout asset, network, and address are required." });
    }

    if (cleanPayoutMethod === "bank" && !cleanBankDetails) {
      return res.status(400).json({ message: "Bank payout details are required." });
    }

    const balance = await getShareBalance(req.user._id);

    if (numericShares > balance.availableShares) {
      return res.status(400).json({ message: `You can sell up to ${balance.availableShares.toLocaleString()} approved ANTP.` });
    }

    const request = await SellRequest.create({
      user: req.user._id,
      shares: numericShares,
      payoutMethod: cleanPayoutMethod,
      brokerageName: cleanPayoutMethod === "brokerage_account" ? cleanBrokerageName : "",
      brokerageAccountNumber: cleanPayoutMethod === "brokerage_account" ? cleanBrokerageAccountNumber : "",
      payoutAsset: cleanPayoutMethod === "crypto" ? cleanPayoutAsset : "",
      payoutNetwork: cleanPayoutMethod === "crypto" ? cleanPayoutNetwork : "",
      payoutAddress: cleanPayoutMethod === "crypto" ? cleanPayoutAddress : "",
      bankDetails: cleanPayoutMethod === "bank" ? cleanBankDetails : "",
      note: cleanString(note),
    });

    return res.status(201).json({
      balance: await getShareBalance(req.user._id),
      request: request.toRecord(),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const requests = await SellRequest.find()
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
      return res.status(400).json({ message: "Status must be pending_review, approved, rejected, or paid." });
    }

    const request = await SellRequest.findById(req.params.id).populate("user");

    if (!request) {
      return res.status(404).json({ message: "Sell request not found." });
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
