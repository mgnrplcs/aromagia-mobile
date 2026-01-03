import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";

export const protectRoute = [
  // Clerk проверяет токен и валидность сессии
  requireAuth(),

  // Своя проверка пользователя в БД
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Ошибка авторизации: неверный токен" });
      // Ищем пользователя в MongoDB
      const user = await User.findOne({ clerkId });
      if (!user)
        return res.status(401).json({ message: "Пользователь не найден" });

      // Сохраняем пользователя в запрос
      req.user = user;

      next();
    } catch (error) {
      console.error("Ошибка в middleware protectRoute:", error);
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  },
];

export const adminOnly = (req, res, next) => {
  // Проверяем, что пользователь залогинен
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Ошибка авторизации: пользователь не найден" });
  }
  // Проверяем роль из базы данных
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Доступ запрещен: требуются права администратора" });
  }
  next();
};
