import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

// Получение корзины текущего пользователя
export async function getCart(req, res) {
  try {
    const user = req.user;
    // 1. Ищем корзину по user._id
    let cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      select: "name price images category brand volume",
    });
    // 2. Если корзины нет — создаем
    if (!cart) {
      cart = await Cart.create({
        user: user._id,
        items: [],
      });
    }
    res.status(200).json({ cart });
  } catch (error) {
    console.error("Ошибка в getCart:", error);
    res.status(500).json({
      message: "Не удалось загрузить корзину",
      error: error.message,
    });
  }
}

// Добавление товара в корзину
export async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = req.user;

    // 1. Проверяем сам товар и его сток
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Недостаточно товара на складе" });
    }

    // 2. Ищем или создаем корзину
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await Cart.create({
        user: user._id,
        items: [],
      });
    }

    // 3. Проверяем, есть ли товар уже в корзине
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Товар уже есть: увеличиваем количество
      const newQuantity = existingItem.quantity + 1;
      // Проверка стока для нового количества
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: "Закончился товар" });
      }
      existingItem.quantity = newQuantity;
    } else {
      // Товара нет: добавляем новый
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // 4. Подгружаем данные перед отправкой
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume",
    });

    res.status(200).json({ message: "Товар добавлен в корзину", cart });
  } catch (error) {
    console.error("Ошибка в addToCart:", error);
    res.status(500).json({
      message: "Не удалось добавить товар",
      error: error.message,
    });
  }
}

// Обновление количества товара (из корзины)
export async function updateQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    if (quantity < 1) {
      return res
        .status(400)
        .json({ error: "Количество должно быть минимум 1" });
    }

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return res.status(400).json({ error: "Корзина не найдена" });
    }

    // Ищем товар внутри массива items
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Товар не найден в корзине" });
    }

    // Проверяем наличие на складе перед изменением
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Товар больше не доступен" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ error: `Недостаточно товара. Доступно: ${product.stock}` });
    }

    // Обновляем количество
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Подгружаем данные для ответа
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume",
    });

    res.status(200).json({ message: "Количество обновлено", cart });
  } catch (error) {
    console.error("Ошибка в updateQuantity:", error);
    res.status(500).json({
      message: "Не удалось изменить количество",
      error: error.message,
    });
  }
}

// Удаление одного товара из корзины
export async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ error: "Корзина не найдена" });
    }

    cart.items.pull({ product: productId });

    await cart.save();

    // Подгружаем данные для ответа
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume",
    });

    res.status(200).json({ message: "Товар удалён из корзины", cart });
  } catch (error) {
    console.error("Ошибка в removeFromCart:", error);
    res.status(500).json({
      message: "Не удалось удалить товар",
      error: error.message,
    });
  }
}

// Полная очистка корзины
export const clearCart = async (req, res) => {
  try {
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ error: "Корзина не найдена" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Корзина очищена", cart });
  } catch (error) {
    console.error("Ошибка в clearCart:", error);
    res.status(500).json({
      message: "Не удалось очистить корзину",
      error: error.message,
    });
  }
};
