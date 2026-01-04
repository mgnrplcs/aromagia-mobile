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

// Возвращает текст и цвет для статуса наличия товара
export const getStockStatusBadge = (stock) => {
  if (stock === 0) return { text: "Нет в наличии", class: "badge-error" };
  if (stock < 20) return { text: "Заканчивается", class: "badge-warning" };
  return { text: "В наличии", class: "badge-success" };
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
