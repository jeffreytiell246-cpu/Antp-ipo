import mongoose from "mongoose";

const sellRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shares: {
      type: Number,
      required: true,
      min: 1,
    },
    payoutMethod: {
      type: String,
      enum: ["brokerage_account", "crypto", "bank"],
      default: "brokerage_account",
    },
    brokerageName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    brokerageAccountNumber: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    payoutAsset: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    payoutNetwork: {
      type: String,
      trim: true,
      default: "",
    },
    payoutAddress: {
      type: String,
      trim: true,
      default: "",
    },
    bankDetails: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "paid"],
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

sellRequestSchema.index({ user: 1, createdAt: -1 });

sellRequestSchema.methods.toRecord = function toRecord() {
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
    shares: this.shares,
    payoutMethod: this.payoutMethod,
    brokerageName: this.brokerageName,
    brokerageAccountNumber: this.brokerageAccountNumber,
    payoutAsset: this.payoutAsset,
    payoutNetwork: this.payoutNetwork,
    payoutAddress: this.payoutAddress,
    bankDetails: this.bankDetails,
    note: this.note,
    status: this.status,
    reviewNote: this.reviewNote,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model("SellRequest", sellRequestSchema);
