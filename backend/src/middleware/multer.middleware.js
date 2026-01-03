import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpeg", ".jpg", ".png", ".webp"].includes(ext) ? ext : "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  },
});

// Фильтрация загружаемых файлов.
// Разрешены только статические изображения: jpeg, jpg, png, webp.
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  // Проверка расширения файла
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  // Проверка MIME-типа
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Допустимы только статические изображения (jpeg, jpg, png, webp)"
      ),
      false
    );
  }
};

// Конфигурация Multer для обработки загрузки файлов.
// Лимиты: Размер - 5MB; Количество - 8 шт.
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
  files: 8,
});
