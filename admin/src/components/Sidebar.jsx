import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router";
import { MENU_GROUPS } from "./Navbar";
import Logo from "../assets/images/icons/aromagia-sm.png";
import { Sparkles, Settings, LogOut } from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const getTabStyle = (isActive) => `
    group flex items-center gap-1 rounded-xl px-0 py-3 transition-all duration-300 is-drawer-close:justify-center relative
    ${
      isActive
        ? "bg-primary/10 text-primary font-bold"
        : "hover:bg-base-200/50 text-base-content/70 hover:text-base-content"
    }
  `;

  return (
    <div className="drawer-side tracking-wide z-50 is-drawer-close:overflow-visible">
      <label
        htmlFor="my-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      <div className="relative flex min-h-full flex-col items-start bg-base-100 border-r border-base-200 text-base-content transition-[width] duration-500 cubic-bezier(0.4, 0, 0.2, 1) is-drawer-close:w-18 is-drawer-open:w-72 is-drawer-open:overflow-hidden is-drawer-close:overflow-visible">
        {/* Вотермарка */}
        <div className="absolute -bottom-20 -right-54 z-0 pointer-events-none select-none transition-opacity duration-500 is-drawer-close:opacity-0 is-drawer-close:hidden">
          <img
            src={Logo}
            alt=""
            className="w-132 h-132 object-contain rotate-12 opacity-[0.055]"
          />
        </div>

        {/* Шапка */}
        <div className="relative z-10 flex h-20 w-full items-center overflow-hidden">
          <div className="flex w-18 shrink-0 items-center justify-center">
            <div className="flex text-2xl size-10 items-center justify-center rounded-xl bg-primary/10 text-primary p-1.5">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
          </div>

          <span className="flex items-baseline truncate font-raleway opacity-100 transition-all duration-300 is-drawer-close:w-0 is-drawer-close:opacity-0 is-drawer-close:translate-x-4">
            <span className="text-xl mb-2 font-bold text-base-content">
              аромагия
            </span>
            <span className="mx-0.5 text-2xl font-bold text-primary">.</span>
            <span className="text-xs uppercase tracking-widest font-semibold text-base-content/50">
              admin
            </span>
          </span>
        </div>

        {/* --- Навигация --- */}
        <ul className="relative z-10 menu w-full grow px-3 pb-4">
          {MENU_GROUPS.map((group, index) => (
            <div key={group.key} className="flex flex-col">
              {index > 0 && (
                <div className="my-2">
                  <div className="divider my-1 h-px opacity-50"></div>
                  {group.label && (
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-base-content/40 is-drawer-close:hidden block mb-1">
                      {group.label}
                    </span>
                  )}
                </div>
              )}

              {/* Элементы группы */}
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link to={item.path} className={getTabStyle(isActive)}>
                        <span
                          className={`shrink-0 flex justify-center w-12 transition-transform duration-300 ${
                            isActive ? "scale-110" : ""
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="whitespace-nowrap text-sm font-medium is-drawer-close:hidden">
                          {item.name}
                        </span>

                        <div className="fixed left-16 px-3 py-2 bg-neutral text-neutral-content text-xs font-medium tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2.5 group-hover:translate-x-0 pointer-events-none z-100 whitespace-nowrap hidden is-drawer-close:group-hover:block shadow-lg">
                          {item.name}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </div>
            </div>
          ))}
        </ul>

        {/* --- Профиль пользователя --- */}
        <div
          ref={menuRef}
          className="relative z-20 w-full border-t border-base-200 p-3 mt-auto bg-base-100"
        >
          <div
            className={`
              absolute bottom-full left-3 right-3 mb-2 
              bg-base-100 rounded-2xl shadow-2xl ring-1 ring-base-200 
              transform transition-all duration-200 origin-bottom p-1.5
              is-drawer-close:left-2 is-drawer-close:w-60
              ${
                isMenuOpen
                  ? "opacity-100 scale-100 translate-y-0 visible"
                  : "opacity-0 scale-95 translate-y-2 invisible pointer-events-none"
              }
            `}
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  openUserProfile();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-base-content hover:bg-base-200 transition-colors text-left"
              >
                <Settings
                  className="w-4 h-4 text-base-content/70"
                  strokeWidth={2.5}
                />
                Настройки профиля
              </button>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Выйти из системы
              </button>
            </div>
          </div>

          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              flex cursor-pointer items-center rounded-xl p-2 transition-all duration-200 group select-none
              ${isMenuOpen ? "bg-base-200" : "hover:bg-base-200"}
            `}
          >
            <div className="flex shrink-0 w-10 justify-center">
              <div className="avatar transition-transform duration-300 group-hover:scale-105">
                <div className="w-10 rounded-full ring-2 ring-base-100 ring-offset-2 ring-offset-base-300">
                  <img src={user?.imageUrl} alt={user?.fullName || "User"} />
                </div>
              </div>
            </div>

            <div className="ml-3 flex min-w-0 flex-1 flex-col is-drawer-close:hidden opacity-100 transition-opacity duration-300">
              <p className="truncate text-sm font-medium text-base-content group-hover:text-primary transition-colors">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-base-content/60">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
