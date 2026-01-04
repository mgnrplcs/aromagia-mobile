import { Route, Routes, Navigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Страница входа — видна только если НЕ вошли в аккаунт */}
      <Route
        path="/login"
        element={isSignedIn ? <Navigate to={"/dashboard"} /> : <LoginPage />}
      ></Route>

      {/* Основная часть приложения — только для авторизированных пользователей */}
      <Route
        path="/"
        element={isSignedIn ? <DashboardLayout /> : <Navigate to={"/login"} />}
      >
        {/* Если зашли на корень / — редирект на Dashboard */}
        <Route index element={<Navigate to={"/dashboard"} />} />

        {/* Вложенные страницы внутри DashboardLayout */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />

        {/* 404 внутри защищённой зоны */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Общий 404 для всего приложения */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
