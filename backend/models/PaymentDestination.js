import mongoose from "mongoose";

const paymentDestinationSchema = new mongoose.Schema(
  {
    asset: {
      type: String,
      required: true,
      enum: ["USDT", "USDC", "ETH", "BTC", "SOL"],
    },
    network: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

paymentDestinationSchema.index({ asset: 1, network: 1 }, { unique: true });

export default mongoose.model("PaymentDestination", paymentDestinationSchema);
