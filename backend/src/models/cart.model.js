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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Виртуальное поле totalPrice
cartSchema.virtual("totalPrice").get(function () {
  if (!this.items || this.items.length === 0) return 0;

  // Пробегаемся по товарам и считаем сумму
  return this.items.reduce((total, item) => {
    // Проверяем, загружен ли продукт (сделан ли populate)
    if (item.product && item.product.price) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);
});

export const Cart = mongoose.model("Cart", cartSchema);
