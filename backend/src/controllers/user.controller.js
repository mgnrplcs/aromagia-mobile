import { User } from "../models/user.model.js";

// Добавление нового адресса
export async function addAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      region,
      zipCode,
      phone,
      isDefault,
    } = req.body;

    const user = req.user;

    // 1. Валидация обязательных полей
    if (!fullName || !streetAddress || !city || !zipCode || !phone) {
      return res.status(400).json({
        message: "Пожалуйста, заполните все обязательные поля.",
      });
    }

    // 2. Валидация формата данных (Индекс РФ - 6 цифр)
    const zipRegex = /^\d{6}$/;
    if (!zipRegex.test(zipCode)) {
      return res.status(400).json({
        message: "Некорректный индекс. Введите 6 цифр.",
      });
    }

    if (phone.length < 10) {
      return res.status(400).json({
        message: "Слишком короткий номер телефона.",
      });
    }

    // 3. Логика для дефолтного адреса
    // Адрес становится основным если:
    //   А) Пользователь поставил галочку isDefault
    //   Б) ИЛИ это самый первый адрес пользователя
    const shouldBeDefault = isDefault || user.addresses.length === 0;

    // Если этот адрес будет главным, у всех остальных снимаем флаг
    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // 4. Создаем объект нового адреса
    const newAddress = {
      label: label || "Дом",
      fullName,
      streetAddress,
      city,
      region: region || "",
      zipCode,
      phone,
      isDefault: shouldBeDefault,
    };

    // 5. Добавляем и сохраняем
    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({
      message: "Адрес успешно добавлен",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Ошибка в addAddress:", error);
    res.status(500).json({
      message: "Не удалось добавить адрес",
      error: error.message,
    });
  }
}

// Получение списка всех адрессов
export async function getAddresses(req, res) {
  try {
    const user = req.user;

    // Сортируем так, чтобы дефолтный адрес был первым (индекс 0)
    const sortedAddresses = user.addresses.sort(
      (a, b) => (b.isDefault === true) - (a.isDefault === true)
    );

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Ошибка в getAddresses:", error);
    res.status(500).json({
      message: "Не удалось получить адреса",
      error: error.message,
    });
  }
}

// Обновление адресса
export async function updateAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      region,
      zipCode,
      phone,
      isDefault,
    } = req.body;

    const { addressId } = req.params;
    const user = req.user;

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Адрес не найден" });
    }

    const shouldBeDefault = isDefault || user.addresses.length === 0;

    // Если пользователь хочет сделать этот адрес главным
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Обновляем поля только если они пришли в запросе
    // (|| address.field оставляет старое значение)
    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.region = region || address.region;
    address.zipCode = zipCode || address.zipCode;
    address.phone = phone || address.phone;

    if (typeof isDefault === "boolean") {
      address.isDefault = isDefault;
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Адрес успешно обновлён", addresses: user.addresses });
  } catch (error) {
    console.error("Ошибка в updateAddress:", error);
    res.status(500).json({
      message: "Не удалось обновить адрес",
      error: error.message,
    });
  }
}

// Удаление адреса
export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = req.user;

    // Находим адрес, чтобы проверить, был ли он дефолтным
    const addressToDelete = user.addresses.id(addressId);

    if (!addressToDelete) {
      return res.status(404).json({ message: "Адрес не найден" });
    }

    const wasDefault = addressToDelete.isDefault;

    // Удаляем адрес из массива
    user.addresses.pull(addressId);

    // Если удалили дефолтный адрес и остались другие адреса,
    // то делаем первый попавшийся адрес новым дефолтным
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Адрес успешно удалён", addresses: user.addresses });
  } catch (error) {
    console.error("Ошибка в deleteAddress:", error);
    res.status(500).json({
      message: "Не удалось удалить адрес",
      error: error.message,
    });
  }
}

// Получения списка избранных товаров
export async function getWishlist(req, res) {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Ошибка в getWishlist:", error);
    res.status(500).json({
      message: "Не удалось получить избранное",
      error: error.message,
    });
  }
}

// Добавление товара в избранное
export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    // 1. Проверка на дубликаты
    const isAlreadyAdded = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyAdded) {
      return res.status(400).json({ message: "Товар уже в избранном" });
    }

    // 2. Добавляем ID в массив
    user.wishlist.push(productId);
    await user.save();

    // Это нужно, чтобы в приложении экран сразу обновился без перезагрузки
    await user.populate("wishlist");

    res.status(200).json({
      message: "Товар был добавлен в избранное",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Ошибка в addToWishlist:", error);
    res.status(500).json({
      message: "Не удалось добавить в избранное",
      error: error.message,
    });
  }
}

// Удаление товара из избранного
export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    // 1. Используем .pull()
    // Он сам найдет нужный ID и удалит его
    user.wishlist.pull(productId);
    await user.save();

    // 2. Снова наполняем данными перед ответом
    await user.populate("wishlist");

    res.status(200).json({
      message: "Товар удалён из избранного",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Ошибка в removeFromWishlist:", error);
    res.status(500).json({
      message: "Не удалось удалить из избранного",
      error: error.message,
    });
  }
}
