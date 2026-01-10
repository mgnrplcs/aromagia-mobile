import { Cart } from "../models/cart.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Product } from "../models/product.model.js";

// Получение корзины текущего пользователя
export async function getCart(req, res) {
  try {
    const user = req.user;
    // 1. Ищем корзину по user._id
    let cart = await Cart.findOne({ user: user._id })
      .populate({
        path: "items.product",
        select: "name price images category brand volume variants",
        populate: { path: "brand", select: "name" },
      })
      .populate("coupon");
    // 2. Если корзины нет — создаем
    if (!cart) {
      cart = await Cart.create({
        user: user._id,
        clerkId: user.clerkId,
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
    const { productId, quantity = 1, volume } = req.body;
    const user = req.user;

    // 1. Проверяем сам товар
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    // 1.1 Определяем вариант (если есть variants)
    let currentStock = product.stock;

    // Если volume передан, ищем вариант. Если нет - берем дефолтный (root)
    // Но теперь мы хотим форсировать variants если они есть
    if (product.variants && product.variants.length > 0) {
      if (!volume) {
        return res.status(400).json({ error: "Необходимо выбрать объем" });
      }
      const variant = product.variants.find(v => v.volume === parseInt(volume));
      if (!variant) {
        return res.status(404).json({ error: "Такой объем не найден" });
      }
      currentStock = variant.stock;
    }

    if (currentStock < quantity) {
      return res.status(400).json({ error: "Недостаточно товара на складе" });
    }

    // 2. Ищем или создаем корзину
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await Cart.create({
        user: user._id,
        clerkId: user.clerkId,
        items: [],
      });
    }

    // 3. Проверяем, есть ли такой же товар C ТАКИМ ЖЕ ОБЪЕМОМ
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && (!volume || item.volume === parseInt(volume))
    );

    if (itemIndex > -1) {
      // Товар уже есть: увеличиваем количество
      const newQuantity = cart.items[itemIndex].quantity + 1;

      // Проверка стока для нового количества
      // (currentStock мы уже вычислили выше для конкретного варианта)
      if (currentStock < newQuantity) {
        return res.status(400).json({ error: "Закончился товар" });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Товара нет: добавляем новый
      // Если volume не передан (legacy product без вариантов), берем product.volume
      const itemVolume = volume ? parseInt(volume) : product.volume;
      cart.items.push({ product: productId, quantity, volume: itemVolume });
    }

    await cart.save();

    // 4. Подгружаем данные перед отправкой
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume variants",
      populate: { path: "brand", select: "name" },
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
    // TODO: Здесь есть проблема. itemIndex найдет ПЕРВЫЙ попавшийся товар с этим ID.
    // А у нас может быть один товар с РАЗНЫМИ объемами.
    // Правильнее было бы передавать cartItemId, но мы передаем productId.
    // Для простоты пока предположим, что фронт шлёт и productId и volume (или cartItemId).
    // Но сигнатура функции updateQuantity(req, res) использует productId из params.
    // Это ограничение текущего API.
    // План Б: мы можем найти товар в корзине, и если их несколько, нам нужно знать какой именно обновлять.
    // Или же (костыль) - мы считаем, что фронт обновляет тот variant, который "подразумевается".

    // !!! КРИТИЧНО: API updateQuantity принимает productId, но не volume. 
    // Если в корзине 2 варианта одного товара, мы не знаем какой обновлять.
    // Я добавлю volume в req.body для уточнения.

    const { volume } = req.body; // Добавляем volume в body для уточнения

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId && (!volume || item.volume === parseInt(volume))
    );

    if (!cartItem) {
      return res.status(404).json({ error: "Товар не найден в корзине" });
    }

    // Получаем индекс для обновления (хотя можно менять по ссылке, но mongoose иногда капризничает, надежнее через индекс если менять массив)
    // Но мы уже нашли объект, изменим его. 

    // Проверяем наличие на складе перед изменением
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Товар больше не доступен" });
    }

    let currentStock = product.stock;
    if (product.variants && product.variants.length > 0) {
      // Ищем вариант соответствующий товару в корзине
      const variant = product.variants.find(v => v.volume === cartItem.volume);
      if (variant) {
        currentStock = variant.stock;
      }
    }

    if (currentStock < quantity) {
      return res
        .status(400)
        .json({ error: `Недостаточно товара. Доступно: ${currentStock}` });
    }

    // Обновляем количество
    cartItem.quantity = quantity;
    await cart.save();

    // Подгружаем данные для ответа
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume variants",
      populate: { path: "brand", select: "name" },
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
    const { volume } = req.body || req.query;
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ error: "Корзина не найдена" });
    }

    if (volume) {
      // Удаляем конкретный вариант
      cart.items = cart.items.filter(
        (item) =>
          !(item.product.toString() === productId && item.volume === parseInt(volume))
      );
    } else {
      // Удаляем все варианты этого товара (legacy/fallback)
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    }

    await cart.save();

    // Подгружаем данные для ответа
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume variants",
      populate: { path: "brand", select: "name" },
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

// Применить купон
export async function applyCoupon(req, res) {
  try {
    const { code } = req.body;
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      select: "name price images category brand volume variants",
      populate: { path: "brand", select: "name" },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ error: "Купон не найден" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: "Этот купон отключен" });
    }

    // Проверка дат
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({ error: "Действие купона еще не началось" });
    }
    if (now > coupon.validUntil) {
      return res.status(400).json({ error: "Срок действия купона истёк" });
    }

    // Проверка лимита использований
    if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
      return res
        .status(400)
        .json({ error: "Лимит использования этого купона исчерпан" });
    }

    // Считаем сумму
    const cartTotal = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    // Проверка минимальной суммы
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        error: `Минимальная сумма заказа для этого купона: ${coupon.minPurchaseAmount} ₽`,
      });
    }

    // Если всё ок
    cart.coupon = coupon._id;
    await cart.save();
    await cart.populate("coupon");

    res.status(200).json({ message: "Купон успешно применен", cart });
  } catch (error) {
    console.error("Ошибка applyCoupon:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}

// Удаление купона
export async function removeCoupon(req, res) {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ user: user._id });

    if (cart) {
      cart.coupon = null;
      await cart.save();
    }

    // Нужно вернуть актуальную корзину
    await cart.populate({
      path: "items.product",
      select: "name price images category brand volume variants",
      populate: { path: "brand", select: "name" },
    });

    res.status(200).json({ message: "Купон удален", cart });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}
