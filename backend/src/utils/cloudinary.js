import cloudinary from "../config/cloudinary.js";

// Загрузка
export const uploadToCloudinary = async (file, folder) => {
  if (!file || !file.buffer) {
    throw new Error("Файл не содержит бинарных данных");
  }
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;
  return cloudinary.uploader.upload(dataURI, {
    folder: folder,
    resource_type: "auto",
    timeout: 60000,
  });
};

// Получение ID
export const getPublicIdFromUrl = (imageUrl) => {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
    const match = imageUrl.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

// Удаление
export const deleteFromCloudinary = async (imageUrl) => {
  const publicId = getPublicIdFromUrl(imageUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }
  }
};
