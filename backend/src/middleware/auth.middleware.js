import { requireAuth, clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const { userId } = req.auth();

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Ошибка авторизации: неверный токен" });
      }

      // 1. Пробуем найти пользователя по Clerk ID
      let user = await User.findOne({ clerkId: userId });

      // 2. Если пользователя НЕТ, запускаем механизм самовосстановления
      if (!user) {
        console.log(
          `⚠️ [ProtectRoute] Пользователь ${userId} не найден. Пытаемся синхронизировать...`
        );

        // Получаем свежие данные прямо из Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
          return res
            .status(400)
            .json({ message: "У пользователя нет Email в Clerk" });
        }

        // 3. Ищем, может пользователь есть в БД, но со старым ID?
        user = await User.findOne({ email: email });

        const isAdmin =
          ENV.ADMIN_EMAIL &&
          email.toLowerCase() === ENV.ADMIN_EMAIL.toLowerCase();

        if (user) {
          // Пользователь найден по почте, но ID устарел
          console.log(
            `♻️ [ProtectRoute] Нашли пользователя по email (${email}). Обновляем Clerk ID...`
          );
          user.clerkId = userId; // Присваиваем НОВЫЙ ID
          user.role = isAdmin ? "admin" : "user";
          await user.save();
        } else {
          // Пользователя вообще нет, создаем с нуля
          console.log(
            `✨ [ProtectRoute] Создаем нового пользователя: ${email}`
          );
          user = new User({
            clerkId: userId,
            email: email,
            firstName: clerkUser.firstName || "Без имени",
            lastName: clerkUser.lastName || "",
            imageUrl: clerkUser.imageUrl || "",
            role: isAdmin ? "admin" : "user",
          });
          await user.save();
        }
      }
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
