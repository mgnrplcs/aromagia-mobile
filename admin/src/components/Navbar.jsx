import { UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router";

import {
  ClipboardListIcon,
  LayoutDashboard,
  PanelLeftIcon,
  ShoppingBagIcon,
  UsersIcon,
  Tags,
} from "lucide-react";

export const NAVIGATION = [
  {
    name: "Главная",
    path: "/dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    name: "Товары",
    path: "/products",
    icon: <ShoppingBagIcon className="size-5" />,
  },
  {
    name: "Бренды",
    path: "/brands",
    icon: <Tags className="size-5" />,
  },
  {
    name: "Заказы",
    path: "/orders",
    icon: <ClipboardListIcon className="size-5" />,
  },
  {
    name: "Клиенты",
    path: "/customers",
    icon: <UsersIcon className="size-5" />,
  },
];

function Navbar() {
  const location = useLocation();

  return (
    <div className="navbar w-full bg-base-300">
      <label
        htmlFor="my-drawer"
        className="btn btn-square btn-ghost"
        aria-label="open sidebar"
      >
        <PanelLeftIcon className="size-5" />
      </label>

      <div className="flex-1 px-4">
        <h1 className="text-lg font-semibold">
          {/* Ищем название страницы, если не нашли — пишем "Главная" */}
          {NAVIGATION.find((item) => item.path === location.pathname)?.name ||
            "Главная"}
        </h1>
      </div>
      <div className="mr-5 mt-1">
        <UserButton />
      </div>
    </div>
  );
}

export default Navbar;
