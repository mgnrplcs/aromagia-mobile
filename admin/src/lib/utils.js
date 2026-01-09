// Делает первую букву заглавной
export const capitalizeText = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Цвет статуса заказа
export const getOrderStatusColor = (status) => {
  switch (status) {
    case "Доставлен":
      return "text-primary";
    case "Отменен":
      return "text-secondary";
    default:
      return "text-base-content";
  }
};

// Цвет статуса возврата
export const getReturnStatusColor = (status) => {
  switch (status) {
    case "Одобрено":
    case "Возврат выполнен":
      return "text-primary";
    case "Отклонено":
      return "text-error";
    default:
      return "text-base-content";
  }
};

export const getOrderStatusBadge = (status) => {
  return "badge-ghost";
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

// Склонение слов
export const getDeclension = (number, titles) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

// Маска для телефона
export const formatPhoneNumber = (value) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const phone = digits.substring(0, 11);
  let formatted = "";

  if (["7", "8"].includes(phone[0])) {
    formatted = "+7";
    if (phone.length > 1) formatted += " (" + phone.substring(1, 4);
    if (phone.length > 4) formatted += ") " + phone.substring(4, 7);
    if (phone.length > 7) formatted += "-" + phone.substring(7, 9);
    if (phone.length > 9) formatted += "-" + phone.substring(9, 11);
  } else {
    formatted = "+7";
    formatted += " (" + phone.substring(0, 3);
    if (phone.length > 3) formatted += ") " + phone.substring(3, 6);
    if (phone.length > 6) formatted += "-" + phone.substring(6, 8);
    if (phone.length > 8) formatted += "-" + phone.substring(8, 10);
  }
  return formatted;
};
