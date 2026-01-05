// Делает первую букву заглавной
export const capitalizeText = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Возвращает класс цвета для бейджика статуса заказа
export const getOrderStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "Доставлен":
    case "delivered":
      return "badge-success";

    case "Отправлен":
    case "shipped":
      return "badge-info";

    case "В ожидании":
    case "pending":
      return "badge-warning";

    case "Отменен":
    case "cancelled":
      return "badge-error";

    default:
      return "badge-ghost";
  }
};

// Форматирует дату
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Склонение слов (число, ['товар', 'товара', 'товаров'])
export const getDeclension = (number, titles) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

// Маска для телефона (+7 (XXX) XXX-XX-XX)
export const formatPhoneNumber = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");

  // Если стираем всё - возвращаем пустоту
  if (!digits) return "";

  // Обрезаем до 11 цифр
  const phone = digits.substring(0, 11);
  let formatted = "";

  if (["7", "8"].includes(phone[0])) {
    formatted = "+7";
    if (phone.length > 1) formatted += " (" + phone.substring(1, 4);
    if (phone.length > 4) formatted += ") " + phone.substring(4, 7);
    if (phone.length > 7) formatted += "-" + phone.substring(7, 9);
    if (phone.length > 9) formatted += "-" + phone.substring(9, 11);
  } else {
    // Если начали не с 7/8, добавляем +7 принудительно
    formatted = "+7";
    formatted += " (" + phone.substring(0, 3);
    if (phone.length > 3) formatted += ") " + phone.substring(3, 6);
    if (phone.length > 6) formatted += "-" + phone.substring(6, 8);
    if (phone.length > 8) formatted += "-" + phone.substring(8, 10);
  }

  return formatted;
};
