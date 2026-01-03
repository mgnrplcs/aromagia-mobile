import express from "express";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import cors from "cors";

import { functions, inngest } from "./config/inngest.js";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = express();

const __dirname = path.resolve();

app.use(express.json());
app.use(clerkMiddleware());
app.use(
  cors({
    // Разрешаем запросы только с фронтенда (например, http://localhost:3000 или https://your-site.com)
    origin: ENV.CLIENT_URL,
    // Разрешаем отправлять куки, HTTP-аутентификацию и другие credentials (например, Authorization заголовки или cookies с токенами) в кросс-доменных запросах.
    // Без этого браузер будет блокировать передачу куки и заголовков аутентификации при запросах с фронтенда на бэкенд.
    // Важно: когда credentials: true, origin НЕ может быть "*", должен быть указан конкретный домен.
    credentials: true,
  })
);

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", cartRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Success" });
});

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
  });
}

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`✅ Server is running on port ${ENV.PORT}`);
  });
};

startServer();
