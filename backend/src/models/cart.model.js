import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true } заставляет Mongoose включать поля,
    // которых нет в базе, но есть в коде (subtotal, totalPrice), в ответ сервера.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Виртуальное поле: Сумма товаров БЕЗ скидки
cartSchema.virtual("subtotal").get(function () {
  if (!this.items || this.items.length === 0) return 0;

  // Считаем сумму
  return this.items.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);
});

// 2. Виртуальное поле: Итоговая цена (С учетом купона)
cartSchema.virtual("totalPrice").get(function () {
  // Берем значение из виртуального поля выше
  let total = this.subtotal;

  if (total === 0) return 0;

  if (this.coupon && this.coupon.discountAmount) {
    // Проверка мин. суммы покупки для купона
    const minPurchase = this.coupon.minPurchaseAmount || 0;

    if (total >= minPurchase) {
      total -= this.coupon.discountAmount;
    }
  }

  // Цена не может быть меньше 0
  return total < 0 ? 0 : total;
});

export const Cart = mongoose.model("Cart", cartSchema);
