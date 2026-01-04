import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ id: "aromagia-mobile" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    // Достаем данные, которые пришли от Clerk
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    // Берем основной email пользователя
    const userEmail = email_addresses[0]?.email_address;

    // Логика определения роли
    //  Мы проверяем: совпадает ли email нового пользователя с ADMIN_EMAIL из .env?
    //    Если да -> присваиваем роль "admin".
    //    Если нет (обычный клиент) -> присваиваем роль "user".
    const isAdmin =
      email === ENV.ADMIN_EMAIL || public_metadata?.role === "admin";

    const userData = {
      clerkId: id,
      email: userEmail,
      firstName: first_name || "",
      lastName: last_name || "",
      imageUrl: image_url,
      role: userRole,
    };

    // Используем findOneAndUpdate с upsert: true.
    // Это защищает от ошибок дубликатов, если вебхук придет дважды.
    await User.findOneAndUpdate({ clerkId: id }, userData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });
  }
);

export const functions = [syncUser, deleteUserFromDB];
