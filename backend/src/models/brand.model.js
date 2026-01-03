import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
      default: "",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
