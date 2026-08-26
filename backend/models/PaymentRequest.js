import mongoose from "mongoose";

const paymentRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amountUsd: {
      type: Number,
      required: true,
      min: 1,
    },
    estimatedShares: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentAsset: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    network: {
      type: String,
      required: true,
      trim: true,
    },
    cryptoDue: {
      type: Number,
      required: true,
      min: 0,
    },
    destinationAddress: {
      type: String,
      required: true,
      trim: true,
    },
    receivingWallet: {
      type: String,
      trim: true,
      default: "",
    },
    senderWallet: {
      type: String,
      trim: true,
      default: "",
    },
    txHash: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    proofImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected"],
      default: "pending_review",
      index: true,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

paymentRequestSchema.index({ user: 1, createdAt: -1 });
paymentRequestSchema.index({ txHash: 1, network: 1 }, { unique: true });

paymentRequestSchema.methods.toRecord = function toRecord() {
  const user = typeof this.user?.toProfile === "function" ? this.user.toProfile() : null;

  return {
    id: this._id.toString(),
    user: user
      ? {
          id: user.id || user._id?.toString(),
          name: user.name,
          email: user.email,
          brokerageName: user.brokerageName,
          brokerageAccountNumber: user.brokerageAccountNumber,
        }
      : null,
    amountUsd: this.amountUsd,
    estimatedShares: this.estimatedShares,
    paymentAsset: this.paymentAsset,
    network: this.network,
    cryptoDue: this.cryptoDue,
    destinationAddress: this.destinationAddress,
    receivingWallet: this.receivingWallet,
    senderWallet: this.senderWallet,
    txHash: this.txHash,
    proofImage: this.proofImage,
    status: this.status,
    reviewNote: this.reviewNote,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model("PaymentRequest", paymentRequestSchema);
