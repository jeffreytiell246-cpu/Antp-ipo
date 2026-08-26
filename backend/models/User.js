import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
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
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.toProfile = function toProfile() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    brokerageName: this.brokerageName,
    brokerageAccountNumber: this.brokerageAccountNumber,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model("User", userSchema);
