import express from "express";
import { requireAuth } from "../middleware/auth.js";
import PaymentDestination from "../models/PaymentDestination.js";
import { isAdminUser } from "../utils/admin.js";

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

function toNestedDestinations(destinations) {
  return destinations.reduce((result, destination) => {
    if (!result[destination.asset]) {
      result[destination.asset] = {};
    }

    result[destination.asset][destination.network] = {
      address: destination.address,
      qrCode: destination.qrCode,
    };

    return result;
  }, {});
}

router.get("/", async (req, res, next) => {
  try {
    const destinations = await PaymentDestination.find().sort({ asset: 1, network: 1 });
    return res.json({ destinations: toNestedDestinations(destinations) });
  } catch (error) {
    next(error);
  }
});

router.put("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { asset, network, address, qrCode = "" } = req.body || {};
    const cleanAsset = String(asset || "").trim().toUpperCase();
    const cleanNetwork = String(network || "").trim();
    const cleanAddress = String(address || "").trim();

    if (!cleanAsset || !cleanNetwork || !cleanAddress) {
      return res.status(400).json({ message: "Asset, network, and address are required." });
    }

    const destination = await PaymentDestination.findOneAndUpdate(
      { asset: cleanAsset, network: cleanNetwork },
      { asset: cleanAsset, network: cleanNetwork, address: cleanAddress, qrCode },
      { new: true, runValidators: true, upsert: true }
    );

    return res.json({
      destination: {
        asset: destination.asset,
        network: destination.network,
        address: destination.address,
        qrCode: destination.qrCode,
      },
    });
  } catch (error) {
    console.error("Payment destination save failed:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "That payment destination already exists. Try saving again." });
    }

    return res.status(500).json({ message: "Could not save payment destination." });
  }
});

export default router;
