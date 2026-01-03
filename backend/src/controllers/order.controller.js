import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";

// Создание заказа
export async function createOrder(req, res) {
  // 1. Запускаем сессию для транзакции
  const session = await Product.startSession();
  session.startTransaction();
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    // 2. Проверка: пустой заказ
    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Товары в заказе отсутствуют" });
    }

    // 3. Валидация товаров и стока
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
    }
    // 4. Создание заказа
    const [createdOrder] = await Order.create(
      [
        {
          user: user._id,
          clerkId: user.clerkId,
          orderItems: orderItems.map((item) => ({
            product: item.product._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
          shippingAddress,
          paymentResult,
          totalPrice,
        },
      ],
      { session }
    );

    // 5. Обновление стока (Уменьшаем количество)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: { stock: -item.quantity },
        },
        { session }
      );
    }
    // 6. Фиксация транзакции
    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Заказ успешно создан", order: createdOrder });
  } catch (error) {
    console.error("Ошибка в createOrder:", error);
    // Если сессия еще активна - отменяем
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
    const orders = await Order.find({ clerkId: user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // 2. Проверка: был ли товар оценен пользователем
    // Собираем ID всех заказов пользователя
    const orderIds = orders.map((o) => o._id);
    // Одним запросом ищем все отзывы к этим заказам
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

    res.status(200).json({ orders: orderWithReviewStatus });
  } catch (error) {
    console.error("Ошибка в getUserOrders:", error);
    res.status(500).json({
      message: "Не удалось получить список заказов",
      error: error.message,
    });
  }
}
