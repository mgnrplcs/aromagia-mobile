import { Link } from "react-router";

function NotFoundPage() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold mt-4">Упс! Страница не найдена</h2>
          <p className="py-5 text-gray-400">
            Похоже, мы не можем найти страницу, которую вы ищете. Возможно, она
            была удалена или перемещена.
          </p>

          <Link
            to="/"
            className="mt-1.5 btn btn-outline btn-base text-primary hover:bg-primary hover:text-white"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
