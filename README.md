# Aromagia — Fullstack экосистема для продажи парфюмерии

Готовое решение для парфюмерного магазина: мобильное приложение для клиентов, админ-панель для управления бизнесом и масштабируемый бэкенд.

## 🚀 Из чего состоит проект

*   **Мобилка (Customer App)**: Приложение на React Native. Здесь клиенты выбирают товары, оформляют заказы и следят за историей покупок.
*   **Админка (Admin Dashboard)**: Веб-интерфейс на React для менеджеров. Позволяет рулить товарами, смотреть аналитику продаж и обрабатывать возвраты.
*   **Бэкенд (Core API)**: Сервер на Express.js. Отвечает за логику, API для фронтов, платежи и интеграцию с внешними сервисами.

---

## 🛠 Стек технологий

### Backend
*   **Среда**: Node.js, Express.js (v5)
*   **БД**: MongoDB + Mongoose
*   **Авторизация**: Clerk (управление пользователями)
*   **Деньги**: Stripe (прием платежей)
*   **Картинки**: Cloudinary
*   **Задачи в фоне**: Inngest
*   **События**: Svix (webhook management)

### Admin Panel
*   **Фронт**: React 19 + Vite 7
*   **Дизайн**: Tailwind CSS v4 + DaisyUI
*   **Стейт**: TanStack Query (React Query)
*   **Роутинг**: React Router 7
*   **Интерактивы**: Recharts (графики), Lucide-react (иконки)

### Mobile App
*   **Платформа**: React Native + Expo (SDK 54)
*   **Навигация**: Expo Router
*   **Стили**: NativeWind (Tailwind для мобилки)
*   **Анимации**: Reanimated
*   **Чекаут**: Stripe SDK
*   **Валидация**: React Hook Form

---

## ✨ Что реализовано

### Для покупателей
- **Каталог**: Удобный поиск и фильтры по категориям.
- **Оплата**: Полноценный цикл покупки через Stripe.
- **Возвраты**: Возможность подать заявку на возврат прямо из приложения (с прикреплением фото).
- **Профиль**: Адресная книга, история заказов и управление аккаунтом.

### Для бизнеса
- **Аналитика**: Графики выручки и заказов в реальном времени.
- **Склад**: Добавление/редактирование товаров и управление остатками.
- **Заказы**: Процессинг заказов и смена статусов.

---

## 📂 Структура папок

```text
aromagia-mobile/
├── admin/            # Веб-интерфейс администратора
├── backend/          # Серверная часть/API
└── mobile/           # Мобильное приложение
```

---

## ⚙️ Как запустить (Development)

1. **Бэкенд**:
   ```bash
   cd backend && npm install && npm run dev
   ```

2. **Админка**:
   ```bash
   cd admin && npm install && npm run dev
   ```

3. **Мобилка**:
   ```bash
   cd mobile && npm install && npx expo start
   ```

---

## 📦 Сборка и Build (Mobile)

Для сборки приложения на устройства используются следующие команды:

**1. Сборка через Expo CLI:**
```bash
# Для Android
npx expo build:android

# Для iOS
npx expo build:ios
```

**2. Локальный запуск (Development Build):**
Если нужно запустить на симуляторе или подключенном устройстве локально:
```bash
cd mobile && npm run android # или ios
```

### Сборка через EAS (Production / Preview)
Для компиляции в облаке или для публикации в сторы:
1. Установите EAS CLI: `npm install -g eas-cli`
2. Соберите билд:
```bash
eas build --platform android # или ios
```

---

## 🔑 Конфигурация (.env)

### Backend
- `MONGO_URI`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `CLOUDINARY_API_KEY` и др.

### Admin
- `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL`.

### Mobile
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

---
