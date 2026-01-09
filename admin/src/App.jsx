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
import CouponsPage from "./pages/CouponsPage";
import ReturnsPage from "./pages/RetrunsPage";

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* === ПУБЛИЧНАЯ ЗОНА === */}
      <Route
        path="/login"
        element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* === ЗАЩИЩЕННАЯ ЗОНА (ADMIN) === */}
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
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="returns" element={<ReturnsPage />} />

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
