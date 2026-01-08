import cloudinary from "../config/cloudinary.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Brand } from "../models/brand.model.js";
import { Cart } from "../models/cart.model.js";
import { Coupon } from "../models/coupon.model.js";
import { ReturnRequest } from "../models/return.model.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// === Товары ===

// Создание нового товара
export async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      volume,
      gender,
      scentFamily,
      concentration,
      notesPyramid,
      isBestseller,
    } = req.body;
    const files = req.files;

    // 1. Валидация обязательных полей
    const missingFields = [];
    if (!name) missingFields.push("Название");
    if (!brand) missingFields.push("Бренд");
    if (!description) missingFields.push("Описание");
    if (!price) missingFields.push("Цена");
    if (!volume) missingFields.push("Объем");
    if (!stock) missingFields.push("Наличие");
    if (!category) missingFields.push("Категория");
    if (!gender) missingFields.push("Пол");
    if (!scentFamily) missingFields.push("Семейство аромата");
    if (!concentration) missingFields.push("Концентрация");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Ошибка валидации: отсутствуют обязательные поля: ${missingFields.join(
          ", "
        )}`,
      });
    }

    // 2. Валидация изображений
    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "Необходимо загрузить хотя бы одно изображение товара",
      });
    }
    if (files.length > 8) {
      return res.status(400).json({
        message: "Превышен лимит: можно загрузить не более 8 фотографий",
      });
    }

    // 3. Обработка нот для поиска
    let notesTags = [];
    let parsedNotes = notesPyramid;
    if (typeof notesPyramid === "string") {
      try {
        parsedNotes = JSON.parse(notesPyramid);
      } catch (e) {}
    }

    if (parsedNotes) {
      const allNotes = [
        parsedNotes.top,
        parsedNotes.middle,
        parsedNotes.base,
      ].filter(Boolean);
      notesTags = Array.from(
        new Set(
          allNotes
            .join(", ")
            .split(/[,;\s]+/)
            .filter((tag) => tag.length > 0)
            .map((tag) => tag.toLowerCase())
        )
      );
    }

    // 4. Загрузка изображений в Cloudinary
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, "products")
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // 5. Создание записи в БД
    const product = await Product.create({
      name,
      brand,
      description,
      price: parseFloat(price),
      volume: parseInt(volume),
      stock: parseInt(stock),
      category,
      gender,
      scentFamily,
      concentration,
      notesPyramid: parsedNotes,
      notesTags,
      images: imageUrls,
      isBestseller: String(isBestseller) === "true",
    });

    res.status(201).json({
      message: "Товар успешно создан",
      product,
    });
  } catch (error) {
    console.error("Ошибка в createProduct:", error);
    res.status(500).json({
      message: "Не удалось создать товар",
      error: error.message,
    });
  }
}

// Получение списка всех товаров
export async function getAllProducts(_, res) {
  try {
    const products = await Product.find()
      .populate("brand", "name logo")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Ошибка в getAllProducts:", error);
    res.status(500).json({
      message: "Не удалось загрузить список товаров",
      error: error.message,
    });
  }
}

// Обновление товара
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    const files = req.files;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    // Обновляем только те поля, которые пришли в запросе
    const simpleFields = [
      "name",
      "brand",
      "description",
      "category",
      "gender",
      "scentFamily",
      "concentration",
    ];
    simpleFields.forEach((field) => {
      if (body[field]) product[field] = body[field];
    });

    if (body.price !== undefined) product.price = parseFloat(body.price);
    if (body.volume !== undefined) product.volume = parseInt(body.volume);
    if (body.stock !== undefined) product.stock = parseInt(body.stock);
    if (body.isBestseller !== undefined)
      product.isBestseller = String(body.isBestseller) === "true";

    // Обработка нот (если передали новую пирамиду)
    if (body.notesPyramid) {
      let parsedNotes = body.notesPyramid;
      if (typeof parsedNotes === "string") {
        try {
          parsedNotes = JSON.parse(parsedNotes);
        } catch (e) {}
      }
      product.notesPyramid = parsedNotes;

      const allNotes = [
        parsedNotes.top,
        parsedNotes.middle,
        parsedNotes.base,
      ].filter(Boolean);
      product.notesTags = Array.from(
        new Set(
          allNotes
            .join(", ")
            .split(/[,;\s]+/)
            .filter((tag) => tag.length > 0)
            .map((tag) => tag.toLowerCase())
        )
      );
    }

    // Обработка фото (если загрузили новые)
    if (files && files.length > 0) {
      if (files.length > 8) {
        return res.status(400).json({
          message: "Превышен лимит: можно загрузить не более 8 фотографий",
        });
      }

      if (product.images && product.images.length > 0) {
        await Promise.all(
          product.images.map((imgUrl) => deleteFromCloudinary(imgUrl))
        );
      }

      // Загружаем новые
      const uploadPromises = files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
      });
      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((result) => result.secure_url);
    }

    await product.save();

    res.status(200).json({
      message: "Товар успешно обновлен",
      product,
    });
  } catch (error) {
    console.error("Ошибка в updateProduct:", error);
    res.status(500).json({
      message: "Не удалось обновить товар",
      error: error.message,
    });
  }
}

// Удаление товара
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((imageUrl) => deleteFromCloudinary(imageUrl))
      );
    }

    // Удаляем сам товар из базы данных
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Товар успешно удалён" });
  } catch (error) {
    console.error("Ошибка в deleteProduct:", error);
    res.status(500).json({
      message: "Не удалось удалить товар",
      error: error.message,
    });
  }
}

// === Заказы ===

// Получение списка всех заказов
export async function getAllOrders(_, res) {
  try {
    const orders = await Order.find()
      // 1. Забираем данные пользователя
      .populate("user", "firstName lastName email phone")
      // 2. Забираем данные о товарах
      .populate("orderItems.product")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Ошибка в getAllOrders:", error);
    res.status(500).json({ message: "Не удалось загрузить список заказов" });
  }
}

// Изменение статуса заказа
export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["В ожидании", "Отправлен", "Доставлен"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Некорректный статус. Разрешенные значения: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    order.status = status;

    // Фиксируем дату изменения статуса
    if (status === "Отправлен" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "Доставлен" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    await order.save();

    res.status(200).json({
      message: `Статус заказа изменен на "${status}"`,
      order,
    });
  } catch (error) {
    console.error("Ошибка в updateOrderStatus:", error);
    res.status(500).json({
      message: "Не удалось обновить статус заказа",
      error: error.message,
    });
  }
}

// === Клиенты ===

// Получение списка всех клиентов
export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Ошибка в getAllCustomers:", error);
    res.status(500).json({
      message: "Не удалось загрузить список покупателей",
      error: error.message,
    });
  }
}

// Редактирование данных клиента
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role } = req.body;
    const imageFile = req.file;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // 1. Обновляем текстовые поля
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    if (role) user.role = role;

    // 2. Загрузка фото
    if (imageFile) {
      if (user.imageUrl) {
        await deleteFromCloudinary(user.imageUrl);
      }
      try {
        console.log("📤 [1/2] Загрузка в Cloudinary...");
        const uploadResponse = await uploadToCloudinary(imageFile, "avatars");
        user.imageUrl = uploadResponse.secure_url;
        console.log("✅ Фото загружено:", user.imageUrl);
      } catch (uploadError) {
        console.error("⚠️ Ошибка Cloudinary:", uploadError.message);
      }
    }

    // 3. Сохраняем в MongoDB
    await user.save();

    // 4. Синхронизация с Clerk
    if (user.clerkId) {
      try {
        console.log("🔄 [2/2] Синхронизация с Clerk...");

        // А. Обновляем текст (Имя, Фамилия, Роль)
        await clerkClient.users.updateUser(user.clerkId, {
          firstName: user.firstName,
          lastName: user.lastName,
          publicMetadata: { role: user.role },
        });

        // Б. Обновляем аватар
        if (imageFile) {
          // 1. Создаем Blob из буфера
          // Что такое Blob?
          //   Если Buffer — это просто "сырой" набор байтов в памяти сервера (набор нулей и единиц),
          //   то Blob (Binary Large Object) — это как "контейнер" для этих данных,
          //   который знает, какого они типа (MIME-type: image/jpeg, image/png).
          const imageBlob = new Blob([imageFile.buffer], {
            type: imageFile.mimetype,
          });
          await clerkClient.users.updateUserProfileImage(user.clerkId, {
            file: imageBlob,
          });
          console.log("✅ Аватарка в Clerk обновлена!");
        }
      } catch (clerkErr) {
        console.error(
          "⚠️ Ошибка обновления в Clerk:",
          clerkErr.errors
            ? JSON.stringify(clerkErr.errors, null, 2)
            : clerkErr.message
        );
      }
    }

    res.status(200).json({ message: "Данные пользователя обновлены", user });
  } catch (error) {
    console.error("Ошибка в updateCustomer:", error);
    res.status(500).json({
      message: "Не удалось обновить пользователя",
      error: error.message,
    });
  }
}

// Удаление клиента ([MongoDB + Clerk] + Корзина)
export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);

    if (!customer) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // 1. Удаляем корзину
    await Cart.findOneAndDelete({ user: id });

    // 1. Удаляем аватарку из Cloudinary
    if (customer.imageUrl) {
      await deleteFromCloudinary(customer.imageUrl);
    }

    // 3. Удаляем из Clerk
    if (customer.clerkId) {
      try {
        await clerkClient.users.deleteUser(customer.clerkId);
        console.log("✅ Пользователь удален из Clerk");
      } catch (clerkError) {
        console.error("⚠️ Ошибка при удалении из Clerk:", clerkError.message);
      }
    }

    // 3. Удаляем из MongoDB
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Пользователь успешно удален" });
  } catch (error) {
    console.error("Ошибка в deleteCustomer:", error);
    res.status(500).json({
      message: "Не удалось удалить пользователя",
      error: error.message,
    });
  }
}

// === Статистика ===

// Статистика для Dashboard
export async function getDashboardStats(_, res) {
  try {
    // 1. Количество заказов
    const totalOrders = await Order.countDocuments();

    // 2. Общая выручка (сумма всех totalPrice)
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 3. Количество пользователей и товаров
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
    });
  } catch (error) {
    console.error("Ошибка в getDashboardStats:", error);
    res.status(500).json({
      message: "Не удалось загрузить статистику",
      error: error.message,
    });
  }
}

// === Бренды ===

// Получение списка всех брендов
export async function getAllBrands(_, res) {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json(brands);
  } catch (error) {
    console.error("Ошибка в getAllBrands:", error);
    res.status(500).json({ message: "Не удалось загрузить бренды" });
  }
}

// Создание бренда
export async function createBrand(req, res) {
  try {
    const { name } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.status(400).json({ message: "Название бренда обязательно" });
    }

    let logoUrl = "";
    if (imageFile) {
      const uploadResponse = await uploadToCloudinary(imageFile, "brands");
      logoUrl = uploadResponse.secure_url;
    }

    const brand = await Brand.create({
      name,
      logo: logoUrl,
    });

    res.status(201).json({ message: "Бренд успешно создан", brand });
  } catch (error) {
    console.error("Ошибка в createBrand:", error);
    res.status(500).json({ message: "Ошибка при создании бренда" });
  }
}

// Обновление бренда
export async function updateBrand(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file;

    const brand = await Brand.findById(id);
    if (!brand) return res.status(404).json({ message: "Бренд не найден" });

    if (name) brand.name = name;

    if (imageFile) {
      if (brand.logo) {
        await deleteFromCloudinary(brand.logo);
      }
      const uploadResponse = await uploadToCloudinary(imageFile, "brands");
      brand.logo = uploadResponse.secure_url;
    }

    await brand.save();
    res.status(200).json({ message: "Бренд успешно обновлен", brand });
  } catch (error) {
    console.error("Ошибка в updateBrand:", error);
    res.status(500).json({ message: "Ошибка при обновлении бренда" });
  }
}

// Удаление бренда
export async function deleteBrand(req, res) {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) return res.status(404).json({ message: "Бренд не найден" });

    if (brand.logo) {
      await deleteFromCloudinary(brand.logo);
    }

    await Product.updateMany({ brand: id }, { $unset: { brand: "" } });
    await Brand.findByIdAndDelete(id);

    res.status(200).json({ message: "Бренд успешно удален" });
  } catch (error) {
    console.error("Ошибка в deleteBrand:", error);
    res.status(500).json({ message: "Ошибка при удалении бренда" });
  }
}

// === Промокоды ===

// Получение списка всех промокодов
export async function getAllCoupons(req, res) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Создание промокода
export async function createCoupon(req, res) {
  try {
    const existing = await Coupon.findOne({ code: req.body.code });
    if (existing)
      return res.status(400).json({ message: "Код уже существует" });

    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Удаление промокода
export async function deleteCoupon(req, res) {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Удалено" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Включение промокода
export async function toggleCouponActive(req, res) {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      coupon.isActive = !coupon.isActive;
      await coupon.save();
      res.json(coupon);
    } else {
      res.status(404).json({ message: "Не найдено" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// === Возвраты ===

// Получить список всех возвратов
export async function getAllReturns(req, res) {
  try {
    const returns = await ReturnRequest.find()
      .populate("user", "firstName lastName email")
      .populate("order", "clerkId totalPrice")
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Обновление статуса возврата
export async function updateReturnStatus(req, res) {
  try {
    const { status, adminComment } = req.body;
    const updated = await ReturnRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminComment },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
