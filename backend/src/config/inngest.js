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

    const userData = event.data?.data || event.data;
    console.log("📥 [SYNC-USER] Обработка данных:", userData?.id);

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

    const email = email_addresses?.[0]?.email_address || "";

    const isAdmin =
      email &&
      ENV.ADMIN_EMAIL &&
      email.toLowerCase() === ENV.ADMIN_EMAIL.toLowerCase();

    const role = isAdmin ? "admin" : "user";

    let user = await User.findOne({ clerkId: id });

    if (!user && email) {
      user = await User.findOne({ email: email });
      if (user) {
        console.log(
          `🔗 [SYNC-USER] Найден старый аккаунт по email. Обновляем ID.`
        );
      }
    }

    if (user) {
      // Обновляем существующего
      user.clerkId = id;
      user.firstName = first_name || user.firstName;
      user.lastName = last_name || user.lastName;
      user.imageUrl = image_url || user.imageUrl;
      user.phone = phone_numbers?.[0]?.phone_number || user.phone;
      user.role = role;

      await user.save();
      console.log(`✅ [SYNC-USER] Обновлено: ${email} (${role})`);
    } else {
      await User.create({
        clerkId: id,
        email: email,
        firstName: first_name || "Без имени",
        lastName: last_name || "",
        imageUrl: image_url || "",
        phone: phone_numbers?.[0]?.phone_number || "",
        role: role,
      });
      console.log(`✨ [SYNC-USER] Создан новый: ${email} (${role})`);
    }
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
