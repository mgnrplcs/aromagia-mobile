// Делает первую букву заглавной
export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Возвращает класс цвета для бейджика статуса заказа
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'доставлен':
    case 'delivered':
      return '#10B981'; // Зеленый

    case 'отправлен':
    case 'shipped':
      return '#3B82F6'; // Синий

    case 'оплачен':
    case 'paid':
      return '#6366F1'; // Индиго

    case 'в ожидании':
    case 'pending':
      return '#F59E0B'; // Желтый

    case 'отменен':
    case 'cancelled':
      return '#EF4444'; // Красный

    default:
      return '#6B7280'; // Серый
  }
};

// Форматирование цены
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
};

// Форматирует дату
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Функция склонения (1 товар, 2 товара, 5 товаров)
export const getDeclension = (number: number, titles: [string, string, string]) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

// Маска для телефона (+7 (XXX) XXX-XX-XX)
export const formatPhoneNumber = (value: string) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');

  // Если стираем всё - возвращаем пустоту
  if (!digits) return '';

  // Обрезаем до 11 цифр
  const phone = digits.substring(0, 11);
  let formatted = '';

  if (['7', '8'].includes(phone[0])) {
    formatted = '+7';
    if (phone.length > 1) formatted += ' (' + phone.substring(1, 4);
    if (phone.length > 4) formatted += ') ' + phone.substring(4, 7);
    if (phone.length > 7) formatted += '-' + phone.substring(7, 9);
    if (phone.length > 9) formatted += '-' + phone.substring(9, 11);
  } else {
    // Если начали не с 7/8, добавляем +7 принудительно
    formatted = '+7';
    formatted += ' (' + phone.substring(0, 3);
    if (phone.length > 3) formatted += ') ' + phone.substring(3, 6);
    if (phone.length > 6) formatted += '-' + phone.substring(6, 8);
    if (phone.length > 8) formatted += '-' + phone.substring(8, 10);
  }

  return formatted;
};
