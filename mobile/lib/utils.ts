// Делает первую букву заглавной
export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Возвращает класс цвета для бейджика статуса заказа
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return '#10B981';
    case 'shipped':
      return '#3B82F6';
    case 'pending':
      return '#F59E0B';
    default:
      return '#666';
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
