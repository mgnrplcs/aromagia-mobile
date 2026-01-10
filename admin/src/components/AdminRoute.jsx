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
      if (!isLoaded) return;

      if (!isSignedIn) {
        setIsRoleChecking(false);
        return;
      }

      try {
        const token = await getToken();
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

  if (!isLoaded || isRoleChecking) {
    return <PageLoader />;
  }
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin === false) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
};

export default AdminRoute;
