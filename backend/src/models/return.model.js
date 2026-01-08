import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    reason: {
      type: String,
      enum: ["Товар поврежден", "Не тот товар", "Больше не нужен", "Другое"],
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: [
        "Ожидает рассмотрения",
        "Одобрено",
        "Отклонено",
        "Возврат выполнен",
      ],
      default: "Ожидает рассмотрения",
    },
    adminComment: {
      type: String,
    },
  },
  { timestamps: true }
);

export const ReturnRequest = mongoose.model("Return", returnSchema);
