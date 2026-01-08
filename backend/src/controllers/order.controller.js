import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Cart } from "../models/cart.model.js";

// Создание заказа
export async function createOrder(req, res) {
  // 1. Запускаем сессию для транзакции
  const session = await Product.startSession();
  session.startTransaction();
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, couponCode } = req.body;

    // 2. Проверка: пустой заказ
    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Товары в заказе отсутствуют" });
    }

    // Переменные для пересчета цены
    let serverSubtotal = 0;
    const finalOrderItems = [];

    // 3.  Валидация товаров, стока и подсчет реальной суммы
    for (const item of orderItems) {
      // Ищем товар внутри сессии
      const product = await Product.findById(item.product._id).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: `Товар ${item.name} не найден` });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: `Недостаточно товара "${item.name}" на складе (Остаток: ${product.stock})`,
        });
      }
      // Считаем сумму по цене из БАЗЫ
      serverSubtotal += product.price * item.quantity;

      finalOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: item.image || product.images[0],
      });
    }

    // 4. Логика Купона
    let discountAmount = 0;
    let finalTotalPrice = serverSubtotal;
    let usedCouponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      }).session(session);

      if (coupon) {
        // Проверяем валидность
        const isValidDate =
          new Date() <= coupon.validUntil && new Date() >= coupon.validFrom;
        const isValidUsage =
          coupon.maxUsage === 0 || coupon.usedCount < coupon.maxUsage;
        const isValidAmount = serverSubtotal >= coupon.minPurchaseAmount;

        if (coupon.isActive && isValidDate && isValidUsage && isValidAmount) {
          discountAmount = coupon.discountAmount;
          usedCouponId = coupon._id;
        }
      }
    }
    // Итоговая цена не может быть меньше 0
    finalTotalPrice = serverSubtotal - discountAmount;
    if (finalTotalPrice < 0) finalTotalPrice = 0;

    // 5. Создание заказа
    const [createdOrder] = await Order.create(
      [
        {
          user: user._id,
          clerkId: user.clerkId,
          orderItems: finalOrderItems,
          shippingAddress,
          paymentResult,
          totalPrice: finalTotalPrice,
          discountAmount,
          couponCode: discountAmount > 0 ? couponCode : null,
        },
      ],
      { session }
    );

    // 6. Обновление стока товаров
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: { stock: -item.quantity },
        },
        { session }
      );
    }

    // 6. Обновление счетчика купон
    if (usedCouponId) {
      await Coupon.findByIdAndUpdate(
        usedCouponId,
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    // 7. Очистка корзины пользователя
    await Cart.findOneAndDelete({ user: user._id }).session(session);

    // 8. Фиксация транзакции
    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Заказ успешно создан", order: createdOrder });
  } catch (error) {
    console.error("Ошибка в createOrder:", error);
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Не удалось создать заказ",
      error: error.message,
    });
  }
}

// Получение заказов пользователя
export async function getUserOrders(req, res) {
  try {
    const user = req.user;

    // 1. Получаем заказы
    const orders = await Order.find({ user: user._id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // 2. Проверка: был ли товар оценен пользователем
    const orderIds = orders.map((o) => o._id);
    const reviews = await Review.find({
      orderId: { $in: orderIds },
      userId: user._id,
    });
    // Создаем Set (набор) ID заказов, на которые уже есть отзывы
    const reviewedOrderIds = new Set(reviews.map((r) => r.orderId.toString()));

    // 3. Формируем итоговый ответ
    const ordersWithStatus = orders.map((order) => ({
      ...order.toObject(),
      hasReviewed: reviewedOrderIds.has(order._id.toString()),
    }));

    res.status(200).json({ orders: ordersWithStatus });
  } catch (error) {
    console.error("Ошибка в getUserOrders:", error);
    res.status(500).json({
      message: "Не удалось получить список заказов",
      error: error.message,
    });
  }
}
