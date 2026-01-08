import { ReturnRequest } from "../models/return.model.js";
import { Order } from "../models/order.model.js";

import { uploadToCloudinary } from "../utils/cloudinary.js";

export async function createReturnRequest(req, res) {
  try {
    const user = req.user;
    // Данные из FormData
    const { orderId, reason, details, items } = req.body;
    const files = req.files;

    // Парсим items, так как через FormData массив приходит строкой
    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch (e) {
      return res.status(400).json({ error: "Неверный формат товаров" });
    }

    // Проверка заказа
    const order = await Order.findOne({ _id: orderId, user: user._id });
    if (!order) return res.status(404).json({ error: "Заказ не найден" });

    // Загрузка фото
    let imageUrls = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        uploadToCloudinary(file, "returns")
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    const newReturn = await ReturnRequest.create({
      user: user._id,
      order: orderId,
      items: parsedItems,
      reason,
      details,
      images: imageUrls,
      status: "Ожидает рассмотрения",
    });

    res
      .status(201)
      .json({ message: "Заявка отправлена", returnRequest: newReturn });
  } catch (error) {
    console.error("Ошибка в createReturnRequest:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}

// Получить историю
export async function getMyReturns(req, res) {
  try {
    const list = await ReturnRequest.find({ user: req.user._id })
      .populate("order", "clerkId totalPrice")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error("Ошибка в getMyReturns:", error);
    res.status(500).json({ error: error.message });
  }
}
