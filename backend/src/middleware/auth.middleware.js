import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";

export const protectRoute = [
  // 1. Проверка токена Clerk
  requireAuth(),

  // 2. Проверка пользователя в БД
  async (req, res, next) => {
    try {
      const { userId } = req.auth();

      if (!userId) {
        console.log("❌ [ProtectRoute] Нет userId в токене");
        return res
          .status(401)
          .json({ message: "Ошибка авторизации: неверный токен" });
      }

      // Ищем пользователя в MongoDB
      const user = await User.findOne({ clerkId: userId });

      if (!user) {
        console.log(
          "❌ [ProtectRoute] Пользователь есть в Clerk, но НЕТ в MongoDB!"
        );
        console.log("💡 Совет: Проверьте Inngest, синхронизация не прошла.");
        return res
          .status(401)
          .json({ message: "Пользователь не найден в базе данных" });
      }

      // Сохраняем пользователя в запрос
      req.user = user;

      next();
    } catch (error) {
      console.error("💥 [ProtectRoute] Ошибка:", error);
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  },
];

export const adminOnly = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ message: "Ошибка авторизации: пользователь не найден" });
  }

  if (user.role !== "admin") {
    console.log(`⛔ [AdminOnly] Доступ запрещен. User role: ${user.role}`);
    return res
      .status(403)
      .json({ message: "Доступ запрещен: требуются права администратора" });
  }

  next();
};
