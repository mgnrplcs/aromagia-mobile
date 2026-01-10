import { Coupon } from "../models/coupon.model.js";

// Получить список доступных купонов для пользователя
export async function getAvailableCoupons(req, res) {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).sort({ validUntil: 1 });

    const availableCoupons = coupons.filter((coupon) => {
      if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
        return false;
      }
      return true;
    });

    res.json(availableCoupons);
  } catch (error) {
    console.error("💥 Ошибка getAvailableCoupons:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}
