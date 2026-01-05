import express from "express";
import { Webhook } from "svix";
import { inngest } from "../config/inngest.js";

const router = express.Router();

router.post(
  "/clerk",
  // Используем raw parser, чтобы получить тело запроса как Buffer для проверки подписи
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

      if (!SIGNING_SECRET) {
        console.error("❌ ОШИБКА: Нет CLERK_WEBHOOK_SECRET в .env");
        return res.status(500).json({ error: "Server misconfiguration" });
      }

      const svix_id = req.headers["svix-id"];
      const svix_timestamp = req.headers["svix-timestamp"];
      const svix_signature = req.headers["svix-signature"];

      // Логируем попытку входа (поможет понять, доходит ли запрос)
      console.log(`📥 [Webhook] Получен запрос от Clerk. ID: ${svix_id}`);

      if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("❌ ОШИБКА: Нет svix заголовков");
        return res.status(400).send("Error: Missing svix headers");
      }

      const wh = new Webhook(SIGNING_SECRET);
      let evt;

      // 1. Проверка подписи
      try {
        evt = wh.verify(req.body.toString(), {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error("❌ ОШИБКА: Подпись не совпала:", err.message);
        return res.status(400).send("Webhook verification failed");
      }

      // 2. Логирование события
      const { id, type } = evt;
      console.log(
        `✅ [Webhook] Подпись OK. Событие: ${type}, User ID: ${evt.data.id}`
      );

      // 3. Отправка в Inngest
      try {
        await inngest.send({
          name: `clerk/${type}`,
          data: evt,
        });
        console.log(`🚀 [Inngest] Событие clerk/${type} отправлено!`);
      } catch (inngestErr) {
        console.error("❌ ОШИБКА Inngest:", inngestErr);
        // Не возвращаем 500, чтобы Clerk не пытался повторить запрос бесконечно,
        // если ошибка на нашей стороне inngest, но вебхук принят.
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("💥 [Webhook] Критическая ошибка:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
