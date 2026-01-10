import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Coupon } from "../models/coupon.model.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

// Создание платежного намерения (Intent)
export async function createPaymentIntent(req, res) {
  try {
    const user = req.user;
    const { shippingAddress } = req.body;

    // 1. Получаем корзину из БД
    const cart = await Cart.findOne({ user: user._id })
      .populate("items.product")
      .populate("coupon");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    // 2. Валидация стоков и пересчет суммы
    let serverSubtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(404).json({ error: "Один из товаров не найден" });
      }

      // Считаем сумму с учетом вариантов
      const variant = product.variants?.find((v) => v.volume === item.volume);
      const unitPrice = variant ? variant.price : product.price;
      const stock = variant ? variant.stock : product.stock;

      if (stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Недостаточно товара "${product.name}" (${item.volume} мл) на складе` });
      }

      serverSubtotal += unitPrice * item.quantity;
    }

    // 3. Логика Купона
    let discountAmount = 0;
    if (cart.coupon && cart.coupon.isActive) {
      // Проверяем валидность купона еще раз
      const isValid = cart.coupon.isValid(serverSubtotal);
      if (isValid) {
        discountAmount = cart.coupon.discountAmount;
      }
    }

    // 4. Итоговая сумма
    // Доставка: допустим бесплатно от 5000р, иначе 300р
    const shippingPrice = serverSubtotal > 5000 ? 0 : 300;

    let total = serverSubtotal - discountAmount + shippingPrice;
    if (total < 0) total = 0;

    // 5. Работа с клиентом Stripe
    let customerId = user.stripeCustomerId;

    if (customerId) {
      // Если есть ID, проверяем, существует ли он в Stripe
      try {
        await stripe.customers.retrieve(customerId);
      } catch (e) {
        customerId = null; // Если удален в Stripe, создадим нового
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        preferred_locales: ["ru"],
        metadata: {
          userId: user._id.toString(),
          clerkId: user.clerkId,
        },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    // 6. Создаем PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "rub",
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      // В metadata кладем ID корзины, чтобы вебхук знал, что превращать в заказ
      metadata: {
        userId: user._id.toString(),
        clerkId: user.clerkId,
        cartId: cart._id.toString(),
        couponId: cart.coupon ? cart.coupon._id.toString() : "",
        shippingAddress: JSON.stringify(shippingAddress),
        discountAmount: discountAmount.toString(),
        totalPrice: total.toString(),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      total,
      discountAmount,
      shippingPrice,
    });
  } catch (error) {
    console.error("Ошибка createPaymentIntent:", error);
    res.status(500).json({ error: "Не удалось инициализировать оплату" });
  }
}

// Обрабатываем оплату
export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Обработка события: Оплата прошла успешно
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("💰 Оплата прошла:", paymentIntent.id);

    try {
      const {
        userId,
        clerkId,
        cartId,
        shippingAddress,
        totalPrice,
        discountAmount,
        couponId,
      } = paymentIntent.metadata;

      // 1. Проверка на дубликаты
      const existingOrder = await Order.findOne({
        "paymentResult.id": paymentIntent.id,
      });
      if (existingOrder) {
        console.log("Заказ уже существует, пропускаем.");
        return res.json({ received: true });
      }

      // 2. Ищем корзину, чтобы перенести товары в заказ
      const cart = await Cart.findById(cartId).populate({
        path: "items.product",
        populate: { path: "brand" },
      });

      if (!cart) {
        console.error("Корзина не найдена для создания заказа!");
        return res.status(404).json({ error: "Cart not found" });
      }

      // Формируем товары для заказа с учетом вариантов
      const orderItems = cart.items.map((item) => {
        const variant = item.product.variants?.find((v) => v.volume === item.volume);
        const unitPrice = variant ? variant.price : item.product.price;

        return {
          product: item.product._id,
          name: item.product.name,
          brand: item.product.brand?.name || "",
          price: unitPrice,
          quantity: item.quantity,
          image: item.product.images?.[0] || "",
          volume: item.volume,
        };
      });

      // 3. Создаем заказ
      const order = await Order.create({
        user: userId,
        clerkId: clerkId,
        orderItems: orderItems,
        shippingAddress: JSON.parse(shippingAddress),
        paymentResult: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          email: paymentIntent.receipt_email,
        },
        totalPrice: parseFloat(totalPrice),
        discountAmount: parseFloat(discountAmount || "0"),
        status: "Оплачен",
      });

      // 4. Обновляем стоки товаров
      for (const item of orderItems) {
        if (item.volume) {
          // Уменьшаем сток конкретного варианта
          await Product.updateOne(
            { _id: item.product, "variants.volume": item.volume },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        } else {
          // Уменьшаем общий сток (legacy)
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }
      }

      // 5. Если был купон, увеличиваем счетчик использования
      if (couponId) {
        await Coupon.findByIdAndUpdate(couponId, {
          $inc: { usedCount: 1 },
        });
      }

      // 6. Очищаем корзину
      await Cart.findByIdAndDelete(cartId);
      // Или: cart.items = []; cart.coupon = null; await cart.save();

      console.log("✅ Заказ успешно создан:", order._id);
    } catch (error) {
      console.error("Ошибка при создании заказа из вебхука:", error);
    }
  }

  res.json({ received: true });
}
