import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const [, , email, role = "admin"] = process.argv;

if (!email || !["user", "admin"].includes(role)) {
  console.error("Usage: node backend/scripts/setUserRole.js user@example.com admin");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is required.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role },
    { new: true }
  );

  if (!user) {
    console.error(`No user found for ${email}.`);
    process.exitCode = 1;
  } else {
    console.log(`${user.email} is now ${user.role}.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
