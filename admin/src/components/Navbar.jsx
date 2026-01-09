import { useLocation } from "react-router";
import { useClerk } from "@clerk/clerk-react";

import {
  ClipboardListIcon,
  LayoutDashboard,
  PanelLeftIcon,
  ShoppingBagIcon,
  UsersIcon,
  Tags,
  LogOut,
  Ticket,
  Undo2,
} from "lucide-react";

export const MENU_GROUPS = [
  {
    key: "main",
    label: "",
    items: [
      {
        name: "Главная",
        path: "/dashboard",
        icon: <LayoutDashboard className="size-5" />,
      },
    ],
  },
  {
    key: "catalog",
    label: "",
    items: [
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
        name: "Клиенты",
        path: "/customers",
        icon: <UsersIcon className="size-5" />,
      },
      {
        name: "Промокоды",
        path: "/coupons",
        icon: <Ticket className="size-5" />,
      },
    ],
  },
  {
    key: "operations",
    label: "",
    items: [
      {
        name: "Заказы",
        path: "/orders",
        icon: <ClipboardListIcon className="size-5" />,
      },
      {
        name: "Возвраты",
        path: "/returns",
        icon: <Undo2 className="size-5" />,
      },
    ],
  },
];

export const NAVIGATION = MENU_GROUPS.flatMap((group) => group.items);

function Navbar() {
  const location = useLocation();
  const { signOut } = useClerk();

  return (
    <div className="navbar tracking-wide w-full bg-base-300">
      <label
        htmlFor="my-drawer"
        className="btn btn-square btn-ghost"
        aria-label="open sidebar"
      >
        <PanelLeftIcon className="size-5" />
      </label>

      <div className="flex-1 px-4">
        <h1 className="text-lg font-semibold">
          {NAVIGATION.find((item) => item.path === location.pathname)?.name ||
            "Главная"}
        </h1>
      </div>
      <div className="mr-2">
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="btn btn-ghost btn-circle text-base-content hover:text-error hover:bg-base-200"
          title="Выйти из аккаунта"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
