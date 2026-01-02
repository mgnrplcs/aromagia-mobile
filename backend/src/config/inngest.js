import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";

export const inngest = new Inngest({ id: "aromagia-mobile" });

// 1. Функция создания/обновления пользователя
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: ["clerk/user.created", "clerk/user.updated"] },
  async ({ event }) => {
    await connectDB();
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      phone_numbers,
    } = event.data;
    const userData = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address || "",
      firstName: first_name || "",
      lastName: last_name || "",
      imageUrl: image_url || "",
      phone: phone_numbers?.[0]?.phone_number || "",
    };

    await User.findOneAndUpdate({ clerkId: id }, userData, {
      upsert: true,
      new: true,
    });
  }
);

// 2. Функция удаления
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.findOneAndDelete({ clerkId: id });
  }
);

export const functions = [syncUser, deleteUserFromDB];
