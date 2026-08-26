import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import paymentDestinationRoutes from "./routes/paymentDestinations.js";
import paymentRequestRoutes from "./routes/paymentRequests.js";
import profileRoutes from "./routes/profile.js";
import sellRequestRoutes from "./routes/sellRequests.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5049;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");
let dbStatus = {
  connected: false,
  message: "Service storage is initializing.",
};

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: dbStatus,
  });
});

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Service temporarily unavailable. Please try again shortly.",
    });
  }

  next();
}

app.use("/api/auth", requireDatabase);
app.use("/api/auth", authRoutes);
app.use("/api/payment-destinations", requireDatabase);
app.use("/api/payment-destinations", paymentDestinationRoutes);
app.use("/api/payment-requests", requireDatabase);
app.use("/api/payment-requests", paymentRequestRoutes);
app.use("/api/profile", requireDatabase);
app.use("/api/profile", profileRoutes);
app.use("/api/sell-requests", requireDatabase);
app.use("/api/sell-requests", sellRequestRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "That email is already registered." });
  }

  console.error(error);
  return res.status(500).json({ message: "Something went wrong." });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required.");
  }

  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required.");
  }

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });

  connectToMongo();
}

async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 7000,
    });
  } catch (error) {
    dbStatus = {
      connected: false,
      message: "Service storage is unavailable.",
    };
    console.error("MongoDB connection failed:", error.message);
    console.log("Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectToMongo, 10000);
  }
}

mongoose.connection.on("connected", () => {
  dbStatus = {
    connected: true,
    message: "Service storage is connected.",
  };
  console.log("MongoDB connected.");
});

mongoose.connection.on("disconnected", () => {
  dbStatus = {
    connected: false,
    message: "Service storage is unavailable.",
  };
  console.warn("MongoDB disconnected.");
});

mongoose.connection.on("error", (error) => {
  dbStatus = {
    connected: false,
    message: "Service storage is unavailable.",
  };
});

startServer().catch((error) => {
  console.error("Failed to start API:", error.message);
  process.exit(1);
});
