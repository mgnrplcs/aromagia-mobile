import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ id: "aromagia-mobile" });

// 1. Функция создания/обновления пользователя
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  [{ event: "clerk/user.created" }, { event: "clerk/user.updated" }],
  async ({ event }) => {
    await connectDB();

    // === 1. Ищем данные пользователя ===
    const userData = event.data?.data || event.data;

    console.log("📥 [SYNC-USER] Обработка данных:", userData?.id);

    // === 2. Безопасная деструктуризация ===
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = userData || {};

    if (!id) {
      console.error("❌ [SYNC-USER] Ошибка: ID пользователя не найден.");
      return;
    }

    // === 3. Безопасное получение email ===
    const email = email_addresses?.[0]?.email_address || "";

    const isAdmin =
      email &&
      ENV.ADMIN_EMAIL &&
      email.toLowerCase() === ENV.ADMIN_EMAIL.toLowerCase();

    const role = isAdmin ? "admin" : "user";

    const userToSave = {
      clerkId: id,
      email: email,
      firstName: first_name || "Без имени",
      lastName: last_name || "",
      imageUrl: image_url || "",
      phone: phone_numbers?.[0]?.phone_number || "",
      role: role,
    };

    await User.findOneAndUpdate({ clerkId: id }, userToSave, {
      upsert: true,
      new: true,
    });

    console.log(`✅ [SYNC-USER] Успешно: ${email} (${role})`);
  }
);

// 2. Функция удаления
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const id = event.data?.data?.id || event.data?.id;

    if (id) {
      await User.findOneAndDelete({ clerkId: id });
      console.log(`🗑️ [DELETE-USER] Пользователь ${id} удален.`);
    }
  }
);

export const functions = [syncUser, deleteUserFromDB];
