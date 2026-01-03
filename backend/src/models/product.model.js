import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // Убираем лишние пробелы
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    volume: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Мужской", "Женский", "Унисекс"],
      required: true,
    },
    scentFamily: {
      type: String,
      required: true,
      index: true,
    },
    concentration: {
      type: String,
      enum: [
        "Духи",
        "Парфюмерная вода",
        "Туалетная вода",
        "Одеколон",
        "Мист",
        "Масляные духи",
      ],
      required: true,
    },
    // Для отображения пирамиды нот на карточке
    notesPyramid: {
      top: { type: String, default: "" },
      middle: { type: String, default: "" },
      base: { type: String, default: "" },
    },
    // Для поиска и фильтрации по отдельным нотам
    notesTags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Создаем текстовый индекс для поиска
productSchema.index({
  name: "text",
  description: "text",
  scentFamily: "text",
  "notesPyramid.top": "text",
  "notesPyramid.middle": "text",
  "notesPyramid.base": "text",
});

export const Product = mongoose.model("Product", productSchema);
