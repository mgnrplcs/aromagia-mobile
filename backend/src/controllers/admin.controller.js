import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

// Утилита для загрузки в CLOUDINARY
// Так как файлы в памяти (buffer), их нужно превратить в base64 перед отправкой
const uploadToCloudinary = async (file, folder) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;

  return cloudinary.uploader.upload(dataURI, {
    folder: folder,
  });
};

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
    // Если notesPyramid пришел как JSON строка, парсим его (бывает при multipart/form-data)
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

// Получение списка всех клиентов
export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find({ role: "user" }).sort({ createdAt: -1 });
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Ошибка в getAllCustomers:", error);
    res.status(500).json({
      message: "Не удалось загрузить список покупателей",
      error: error.message,
    });
  }
}

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
