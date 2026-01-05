import { Route, Routes, Navigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import BrandsPage from "./pages/BrandsPage";
import NotFoundPage from "./pages/NotFoundPage";

import DashboardLayout from "./layouts/DashboardLayout";
import PageLoader from "./components/PageLoader";
import AdminRoute from "./components/AdminRoute";

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  // Глобальный лоадер инициализации Clerk
  if (!isLoaded) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* === ПУБЛИЧНАЯ ЗОНА === */}
      {/* Если юзер уже вошел, со страницы логина кидаем сразу в админку */}
      <Route
        path="/login"
        element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* === ЗАЩИЩЕННАЯ ЗОНА (ADMIN) === */}
      {/* 1. Сначала срабатывает AdminRoute. Он проверит роль. */}
      {/* Если не админ — покажет AccessDeniedPage. Layout даже не загрузится. */}
      <Route element={<AdminRoute />}>
        {/* 2. Если роль OK, грузится DashboardLayout (Сайдбар + Навбар) */}
        <Route element={<DashboardLayout />}>
          {/* Редирект с корня / на /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Вложенные страницы */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />

          {/* 404 для неизвестных страниц внутри админки */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      {/* === ОБЩИЙ 404 (Для путей, не попавших в другие правила) === */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
