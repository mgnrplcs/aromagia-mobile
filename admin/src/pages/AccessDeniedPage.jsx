import { Link } from "react-router";
import { useClerk } from "@clerk/clerk-react";
import { Home, LogOut, TriangleAlert, Ban, Headset } from "lucide-react";

function AccessDeniedPage() {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 relative overflow-hidden">
      {/* 1. Блок заголовка */}
      <div className="text-center mb-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-center text-primary text-9xl font-black leading-none select-none drop-shadow-sm">
          <span>4</span>
          <Ban
            className="w-[0.85em] h-[0.85em] text-secondary mx-1"
            strokeWidth={3.5}
          />
          <span>3</span>
        </div>

        <h2 className="text-3xl font-bold text-base-content mt-3">
          Доступ ограничен
        </h2>
      </div>

      {/* 2. Карточка */}
      <div className="card w-full max-w-lg tracking-wide bg-base-100 shadow-xl">
        <div className="card-body p-6 sm:p-8">
          {/* Предупреждение */}
          <div className="bg-base-200/50 border border-base-200 rounded-xl p-4 flex gap-4 items-center text-left">
            <TriangleAlert className="w-6 h-6 text-warning shrink-0 mb-1" />
            <p className="text-sm font-medium text-base-content/80 leading-relaxed">
              Упс! Похоже, у вашего аккаунта недостаточно{" "}
              <br className="hidden sm:block" />
              прав для доступа к административной панели
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Link
              to="/"
              className="btn btn-primary flex-1 gap-2 shadow-lg shadow-primary/20"
            >
              <Home size={18} />
              На главную
            </Link>

            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="btn btn-outline flex-1 gap-2 border-base-300 text-base-content/70 hover:text-error hover:border-error hover:bg-base-100 transition-colors"
            >
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* 3. Блок техподдержки (справа внизу) */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4.5 opacity-70 transition-opacity">
        <div className="flex flex-col items-end gap-2">
          <a
            href="mailto:aromagia@service.ru"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            aromagia@service.ru
          </a>

          <a
            href="tel:+79999999999"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            +7 (999) 999-99-99
          </a>
        </div>

        <div className="flex items-center h-full">
          <Headset size="28" />
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedPage;
