import mongoose from "mongoose";
import { Coupon } from "../models/coupon.model.js";
import { ENV } from "../config/env.js";

const seedCoupons = async () => {
  try {
    // 1. Подключение к БД
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Подключено к MongoDB");

    // 2. Очистка старых купонов
    await Coupon.deleteMany({});
    console.log("🗑️  Старые купоны удалены");

    // 3. Данные для загрузки
    const couponsData = [
      {
        code: "WELCOME500",
        discountAmount: 500,
        minPurchaseAmount: 1500,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 дней
        maxUsage: 0, // Безлимитный
        isActive: true,
      },
      {
        code: "SUMMER2026",
        discountAmount: 1000,
        minPurchaseAmount: 5000,
        validUntil: new Date("2026-09-01"),
        maxUsage: 100,
        usedCount: 12,
        isActive: true,
      },
      {
        code: "VIP_CLIENT",
        discountAmount: 2000,
        minPurchaseAmount: 10000,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 365)), // +1 год
        maxUsage: 50,
        usedCount: 45, // Почти закончился
        isActive: true,
      },
      {
        code: "BLACK_FRIDAY",
        discountAmount: 1500,
        minPurchaseAmount: 3000,
        validUntil: new Date(new Date().setDate(new Date().getDate() - 10)), // Истек 10 дней назад
        maxUsage: 0,
        isActive: true, // Активен флажком, но истек по дате
      },
      {
        code: "TEST_LIMIT",
        discountAmount: 100,
        minPurchaseAmount: 0,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 5)),
        maxUsage: 10,
        usedCount: 10, // Лимит исчерпан
        isActive: true,
      },
      {
        code: "HIDDEN_PROMO",
        discountAmount: 300,
        minPurchaseAmount: 0,
        validUntil: new Date(new Date().setDate(new Date().getDate() + 60)),
        maxUsage: 0,
        isActive: false, // Выключен вручную
      },
    ];

    // 4. Создание
    await Coupon.insertMany(couponsData);
    console.log(`🎉 Успешно создано ${couponsData.length} промокодов!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка при создании купонов:", error);
    process.exit(1);
  }
};

seedCoupons();
