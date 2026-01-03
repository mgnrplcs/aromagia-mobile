import { Product } from "../models/product.model.js";

// Получение конкретного товара по ID
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    // Если в базе нет товара с таким ID
    if (!product) return res.status(404).json({ message: "Товар не найден" });

    res.status(200).json({ product });
  } catch (error) {
    console.error("Ошибка в getProductById:", error);
    res.status(500).json({
      message: "Не удалось получить информацию о товаре",
      error: error.message,
    });
  }
}

// 🧠 Умные рекомендации
//   GET /api/products/recommendations
//   GET /api/products/recommendations?productId=...
export async function getRecommendedProducts(req, res) {
  try {
    const { productId } = req.query;
    let products = [];

    // Сценарий 1: Контекстные рекомендации (Похожие товары
    // Работает, если передан ID текущего товара (страница товара))
    if (productId) {
      const currentProduct = await Product.findById(productId);

      if (productId) {
        const currentProduct = await Product.findById(productId);

        if (currentProduct) {
          // Приоритет 1: То же семейство (напр. "Цветочные") + Тот же пол + Другой ID
          products = await Product.find({
            scentFamily: currentProduct.scentFamily,
            gender: currentProduct.gender,
            _id: { $ne: productId },
          })
            .populate("brand", "name logo")
            .limit(4);

          // Приоритет 2: Если нашли меньше 4 товаров, добиваем товарами того же бренда
          if (products.length < 4) {
            const excludeIds = [productId, ...products.map((p) => p._id)];

            const brandProducts = await Product.find({
              brand: currentProduct.brand,
              _id: { $nin: excludeIds },
            })
              .populate("brand", "name logo")
              .limit(4 - products.length);

            products = [...products, ...brandProducts];
          }
        }
      }
    }

    // СЦЕНАРИЙ 2: "Хиты продаж" (Главная страница)
    // Работает, если productId не передан ИЛИ если "Похожих" товаров не нашлось
    if (products.length === 0) {
      // Агрегация: считаем, какие товары чаще всего встречаются в заказах
      const bestSellers = await Order.aggregate([
        // 1. "Разворачиваем" массив товаров в заказах
        { $unwind: "$orderItems" },
        // 2. Группируем по ID товара и суммируем количество
        {
          $group: {
            _id: "$orderItems.product",
            totalSold: { $sum: "$orderItems.quantity" },
          },
        },
        // 3. Сортируем: кто больше продан — тот выше
        { $sort: { totalSold: -1 } },
        // 4. Берем топ-4
        { $limit: 4 },
      ]);

      // Достаем полные данные товаров по ID
      const bestSellerIds = bestSellers.map((item) => item._id);

      products = await Product.find({ _id: { $in: bestSellerIds } }).populate(
        "brand",
        "name logo"
      );
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error("Ошибка в getRecommendedProducts:", error);
    res.status(500).json({
      message: "Не удалось загрузить рекомендации",
      error: error.message,
    });
  }
}
