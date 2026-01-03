import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

// Вспомогательная функция для пересчета рейтинга товара
async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
  const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
}

// Создание отзыва
export async function createReview(req, res) {
  try {
    const user = req.user;
    const { productId, orderId, rating, comment } = req.body;

    // 1. Базовая валидация
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Рейтинг должен быть от 1 до 5" });
    }

    // 2. Проверка заказа
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    // Проверяем, что заказ принадлежит этому пользователю
    if (order.clerkId !== user.clerkId) {
      return res
        .status(403)
        .json({ message: "Вы не можете оценивать чужие заказы" });
    }

    // Проверяем статус
    if (order.status !== "Доставлен") {
      return res.status(400).json({
        message: "Оставить отзыв можно только после доставки товара",
      });
    }

    // 3. Проверяем, был ли этот товар в заказе
    const productInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (!productInOrder) {
      return res
        .status(400)
        .json({ message: "Этого товара нет в указанном заказе" });
    }

    // 4. Проверяем, не оставлял ли уже отзыв
    const existingReview = await Review.findOne({
      productId,
      userId: user._id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Вы уже оставили отзыв на этот товар" });
    }

    // 5. Создаем отзыв
    const review = await Review.create({
      productId,
      userId: user._id,
      orderId,
      rating: Number(rating),
      comment: comment || "",
    });

    // 6. Пересчитываем рейтинг товара
    await updateProductRating(productId);

    res.status(200).json({ message: "Отзыв успешно опубликован", review });
  } catch (error) {
    console.error("Ошибка в createReview:", error);
    res.status(500).json({
      message: "Не удалось опубликовать отзыв",
      error: error.message,
    });
  }
}

// Удаление отзыва
export async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    // 1. Ищем отзыв
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Отзыв не найден" });
    }

    // 2. Проверяем права (удалить может только автор или админ)
    const isOwner = review.userId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "У вас нет прав удалять этот отзыв" });
    }

    // 3. Удаляем
    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // 4. Пересчитываем рейтинг товара
    await updateProductRating(productId);

    res.status(200).json({ message: "Отзыв успешно удален" });
  } catch (error) {
    console.error("Ошибка в deleteReview:", error);
    res.status(500).json({
      message: "Не удалось удалить рейтинг",
      error: error.message,
    });
  }
}

// Получение отзывов для конкретного товара
export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate("userId", "firstName lastName imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Ошибка в getProductReviews:", error);
    res.status(500).json({ message: "Не удалось загрузить отзывы" });
  }
}
