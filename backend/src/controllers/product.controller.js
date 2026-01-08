import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

// Получение конкретного товара по ID
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("brand");

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
export async function getRecommendedProducts(req, res) {
  try {
    const { productId } = req.query;
    let products = [];

    // Сценарий 1: Контекстные рекомендации
    if (productId) {
      const currentProduct = await Product.findById(productId);

      if (currentProduct) {
        // Приоритет 1: То же семейство + пол
        products = await Product.find({
          scentFamily: currentProduct.scentFamily,
          gender: currentProduct.gender,
          _id: { $ne: productId },
        })
          .populate("brand", "name logo")
          .limit(4);

        // Приоритет 2: Добиваем брендом
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

    // СЦЕНАРИЙ 2: "Хиты продаж" (если ничего не нашли или нет ID)
    if (products.length === 0) {
      const bestSellers = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.product",
            totalSold: { $sum: "$orderItems.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 4 },
      ]);

      const bestSellerIds = bestSellers.map((item) => item._id);

      products = await Product.find({ _id: { $in: bestSellerIds } }).populate(
        "brand",
        "name logo"
      );
    }

    // Фолбэк (если заказов еще нет — просто берем последние добавленные)
    if (products.length === 0) {
      products = await Product.find().limit(4).populate("brand", "name logo");
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
