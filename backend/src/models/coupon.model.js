import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    maxUsage: {
      type: Number,
      default: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Проверка валидности купона (метод экземпляра)
couponSchema.methods.isValid = function (cartTotal) {
  const now = new Date();

  // 1. Активен ли вообще
  if (!this.isActive) return false;

  // 2. Проверка дат
  if (now < this.validFrom || now > this.validUntil) return false;

  // 3. Лимит использования (если maxUsage > 0)
  if (this.maxUsage > 0 && this.usedCount >= this.maxUsage) return false;

  // 4. Минимальная сумма покупки
  if (cartTotal < this.minPurchaseAmount) return false;

  return true;
};

export const Coupon = mongoose.model("Coupon", couponSchema);
