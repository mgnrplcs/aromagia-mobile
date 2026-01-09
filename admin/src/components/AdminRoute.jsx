import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { userApi } from "../lib/api.js";
import AccessDeniedPage from "../pages/AccessDeniedPage";
import PageLoader from "./PageLoader";

const AdminRoute = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [isAdmin, setIsAdmin] = useState(null);
  const [isRoleChecking, setIsRoleChecking] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      // 1. Ждем Clerk
      if (!isLoaded) return;

      if (!isSignedIn) {
        setIsRoleChecking(false);
        return;
      }

      try {
        const token = await getToken();
        // 3. Спрашиваем бэкенд о роли
        const dbUser = await userApi.getMe(token);
        setIsAdmin(dbUser.role === "admin");
      } catch (error) {
        console.error("Ошибка проверки прав:", error);
        setIsAdmin(false);
      } finally {
        setIsRoleChecking(false);
      }
    };

    checkUserRole();
  }, [isLoaded, isSignedIn, getToken]);

  // === РЕНДЕРИНГ ===

  // 1. Показываем лоадер, пока грузится Clerk ИЛИ идет запрос к БД
  if (!isLoaded || isRoleChecking) {
    return <PageLoader />;
  }

  // 2. Если пользователь не вошел в систему -> Редирект на логин
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3. Если вошел, но НЕ админ -> Показываем страницу ошибки
  if (isAdmin === false) {
    return <AccessDeniedPage />;
  }

  // 4. Если Админ -> Рендерим дочерние роуты (Outlet)
  return <Outlet />;
};

export default AdminRoute;
