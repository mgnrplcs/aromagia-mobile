import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Brand } from "../models/brand.model.js";
import { ENV } from "../config/env.js";

// === НАСТРОЙКА ПУТЕЙ ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к папкам с картинками (images/brands и images/perfumes)
const BRANDS_PATH = path.join(__dirname, "images", "brands");
const PERFUMES_PATH = path.join(__dirname, "images", "perfumes");

// === ФУНКЦИЯ ЗАГРУЗКИ ===
const uploadLocalImage = async (folderPath, filename, cloudFolder) => {
  try {
    const filePath = path.join(folderPath, filename);

    // Проверяем, существует ли файл перед загрузкой
    if (!fs.existsSync(filePath)) {
      console.error(`⚠️  Файл не найден: ${filename}`);
      console.error(`    (Искал здесь: ${filePath})`);
      return "https://dummyimage.com/500x500/cccccc/000000.jpg&text=No+Image";
    }

    // Загружаем в Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: cloudFolder,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Ошибка загрузки ${filename}:`, error.message);
    return "https://dummyimage.com/500x500/cccccc/000000.jpg&text=Error";
  }
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Подключено к MongoDB");

    // Очистка базы
    await Product.deleteMany({});
    await Brand.deleteMany({});
    console.log("🗑️  Старые данные удалены");

    // ==========================================
    // 1. ЗАГРУЗКА БРЕНДОВ
    // ==========================================
    console.log("\n⏳ Загружаем бренды из images/brands...");

    // Точное соответствие имен файлов, которые ты прислал
    const brandsList = [
      { name: "Dior", file: "dior.jpg" },
      { name: "Chanel", file: "chanel.jpg" },
      { name: "Dolce & Gabbana", file: "Dolce & Gabbana.jpg" },
      { name: "Marc-Antoine Barrois", file: "Marc-Antoine Barrois.png" },
      { name: "Yves Saint Laurent", file: "Yves Saint Laurent.jpg" },
      { name: "Rabanne", file: "Rabanne.jpg" },
      { name: "Guerlain", file: "Guerlain.jpg" },
      { name: "Carolina Herrera", file: "Carolina Herrera.jpg" },
      { name: "Armani", file: "Armani.jpg" },
    ];

    const createdBrands = [];

    for (const b of brandsList) {
      const logoUrl = await uploadLocalImage(BRANDS_PATH, b.file, "brands");

      const newBrand = await Brand.create({
        name: b.name,
        logo: logoUrl,
      });
      createdBrands.push(newBrand);
      console.log(`   -> Бренд ${b.name} создан.`);
    }

    const getBrandId = (name) => {
      const brand = createdBrands.find((b) =>
        b.name.toLowerCase().includes(name.toLowerCase())
      );
      if (!brand) console.error(`⚠️ Не найден бренд для: ${name}`);
      return brand?._id;
    };

    // ==========================================
    // 2. ЗАГРУЗКА ТОВАРОВ
    // ==========================================
    console.log("\n⏳ Загружаем товары из images/perfumes...");

    const productsData = [
      {
        name: "J'Adore Eau de Toilette",
        brandName: "Dior",
        price: 13500,
        volume: 50,
        category: "Цветочные",
        gender: "Женский",
        scentFamily: "Свежие",
        concentration: "Туалетная вода",
        description:
          "Культовый аромат, ставший символом абсолютной женственности. Сияющая композиция раскрывается свежестью эссенции красного апельсина. В сердце — нероли из Валлориса, а завершает симфонию чувственная нота дамасской розы.",
        notesPyramid: {
          top: "Эссенция красного апельсина",
          middle: "Нероли из Валлориса",
          base: "Дамасская роза",
        },
        notesTags: ["цветы", "женственность", "роза"],
        imageFiles: ["J'Adore Eau de Toilette.webp"],
        isBestseller: true,
      },
      {
        name: "Sauvage Eau de Parfum",
        brandName: "Dior",
        price: 11800,
        volume: 60,
        category: "Фужерные",
        gender: "Мужской",
        scentFamily: "Восточные",
        concentration: "Парфюмерная вода",
        description:
          "Благородный и мощный шлейф. Интерпретация свежести, обогащенная пряными и дымными акцентами. Калабрийский бергамот встречается с амброксаном, оставляя величественный древесный след.",
        notesPyramid: {
          top: "Калабрийский бергамот",
          middle: "Сычуаньский перец, Лаванда",
          base: "Амброксан, Ваниль",
        },
        notesTags: ["пряный", "брутальный", "бергамот"],
        imageFiles: ["Sauvage Eau de Parfum.webp"],
        isBestseller: true,
      },
      {
        name: "BLEU DE CHANEL",
        brandName: "Chanel",
        price: 12100,
        volume: 50,
        category: "Древесные",
        gender: "Мужской",
        scentFamily: "Фужерные",
        concentration: "Туалетная вода",
        description:
          "Аромат свободы в глубоком синем флаконе. Неподвластная времени древесно-ароматическая композиция. Для мужчины, который отвергает шаблоны и следует собственному сценарию жизни.",
        notesPyramid: {
          top: "Лимон, Мята, Розовый перец",
          middle: "Имбирь, Мускатный орех, Жасмин",
          base: "Лабданум, Сандал, Кедр",
        },
        notesTags: ["статус", "офис", "классика"],
        imageFiles: ["BLEU DE CHANEL.webp", "BLEU DE CHANEL_2.webp"],
        isBestseller: false,
      },
      {
        name: "L'IMPERATRICE",
        brandName: "Dolce & Gabbana",
        price: 7900,
        volume: 50,
        category: "Фруктовые",
        gender: "Женский",
        scentFamily: "Водные",
        concentration: "Туалетная вода",
        description:
          "Взрывной коктейль из экзотических фруктов. Аромат для звезды, чья жизнь полна ярких красок. Сочные ноты киви и арбуза сплетаются с нежностью розового цикламена.",
        notesPyramid: {
          top: "Киви, Ревень",
          middle: "Арбуз, Розовый цикламен",
          base: "Мускус, Сандал",
        },
        notesTags: ["лето", "арбуз", "фрукты"],
        imageFiles: ["L'IMPERATRICE.webp", "L'IMPERATRICE_2.webp"],
        isBestseller: true,
      },
      {
        name: "GANYMEDE",
        brandName: "Marc-Antoine Barrois",
        price: 24500,
        volume: 30,
        category: "Древесные",
        gender: "Унисекс",
        scentFamily: "Пряные",
        concentration: "Парфюмерная вода",
        description:
          "Феномен нишевой парфюмерии. Новое видение элегантности: минеральное, свежее и насыщенное. Мягкость кожи встречается с сиянием мандарина и пряностью шафрана.",
        notesPyramid: {
          top: "Мандарин, Шафран",
          middle: "Фиалка, Османтус",
          base: "Бессмертник, Дерево Акигала",
        },
        notesTags: ["космос", "глянец", "ниша"],
        imageFiles: ["GANYMEDE.webp", "GANYMEDE_2.webp"],
        isBestseller: true,
      },
      {
        name: "BLACK OPIUM",
        brandName: "Yves Saint Laurent",
        price: 13200,
        volume: 50,
        category: "Гурманские",
        gender: "Женский",
        scentFamily: "Восточные",
        concentration: "Парфюмерная вода",
        description:
          "Доза адреналина в стиле глэм-рок. Энергия черного кофе электризует букет белых цветов, а ваниль добавляет композиции сладкую и дерзкую чувственность.",
        notesPyramid: {
          top: "Аккорд кофе, Розовый перец",
          middle: "Флердоранж, Жасмин",
          base: "Ваниль, Пачули, Кедр",
        },
        notesTags: ["кофе", "вечер", "ваниль"],
        imageFiles: ["BLACK OPIUM.webp", "BLACK OPIUM_2.webp"],
        isBestseller: true,
      },
      {
        name: "1 Million",
        brandName: "Rabanne",
        price: 9400,
        volume: 50,
        category: "Древесные",
        gender: "Мужской",
        scentFamily: "Пряные",
        concentration: "Туалетная вода",
        description:
          "Аромат для мужчин, которые не боятся быть в центре внимания. Золотой слиток, воплощающий власть. Свежесть грейпфрута и мяты сменяется аккордом розы и корицы.",
        notesPyramid: {
          top: "Красный мандарин, Мята",
          middle: "Роза, Корица",
          base: "Кожа, Амбра",
        },
        notesTags: ["золото", "клуб", "сладкий"],
        imageFiles: ["1 Million.webp"],
        isBestseller: true,
      },
      {
        name: "Aqua Allegoria Mandarine Basilic",
        brandName: "Guerlain",
        price: 11900,
        volume: 75,
        category: "Цитрусовые",
        gender: "Женский",
        scentFamily: "Фужерные",
        concentration: "Туалетная вода",
        description:
          "Искрящийся и жизнерадостный аромат. Неожиданный дуэт: сочная мякоть мандарина встречается с ароматной свежестью базилика. Напоминает о летнем пикнике на траве.",
        notesPyramid: {
          top: "Клементин, Цветок апельсина",
          middle: "Мандарин, Базилик, Пион",
          base: "Сандал, Амбра",
        },
        notesTags: ["мандарин", "лето", "свежесть"],
        imageFiles: [
          "Aqua Allegoria Mandarine Basilic.webp",
          "Aqua Allegoria Mandarine Basilic_2.webp",
          "Aqua Allegoria Mandarine Basilic_3.webp",
          "Aqua Allegoria Mandarine Basilic_4.webp",
        ],
        isBestseller: false,
      },
      {
        name: "ACQUA DI GIO",
        brandName: "Armani",
        price: 9800,
        volume: 100,
        category: "Акватические",
        gender: "Мужской",
        scentFamily: "Свежие",
        concentration: "Туалетная вода",
        description:
          "Ода совершенству природы. Аромат, рожденный морем, солнцем и землей. Свежесть калабрийского бергамота смешивается с морскими нотами и терпкостью хурмы.",
        notesPyramid: {
          top: "Лайм, Лимон, Бергамот",
          middle: "Морские ноты, Персик",
          base: "Белый мускус, Кедр",
        },
        notesTags: ["море", "классика", "цитрус"],
        imageFiles: ["ACQUA DI GIO.webp", "ACQUA DI GIO_2.webp"],
        isBestseller: true,
      },
      {
        name: "CH MEN",
        brandName: "Carolina Herrera",
        price: 10900,
        volume: 50,
        category: "Восточные",
        gender: "Мужской",
        scentFamily: "Пряные",
        concentration: "Туалетная вода",
        description:
          "Путешествие мужчины, полного страсти. Аромат вдохновлен жизнью, полной открытий. Сочетает эксцентричность шафрана с классической элегантностью кожи и замши.",
        notesPyramid: {
          top: "Трава, Бергамот, Грейпфрут",
          middle: "Мускатный орех, Шафран",
          base: "Кожа, Ваниль, Замша",
        },
        notesTags: ["стиль", "кожа", "осень"],
        imageFiles: ["CH MEN.webp"],
        isBestseller: false,
      },
    ];

    for (const p of productsData) {
      const brandId = getBrandId(p.brandName);
      if (!brandId) {
        console.log(`⏭️  Пропуск товара ${p.name}: бренд не найден.`);
        continue;
      }

      // Загружаем картинки
      const cloudImages = [];
      for (const filename of p.imageFiles) {
        const url = await uploadLocalImage(PERFUMES_PATH, filename, "products");
        cloudImages.push(url);
      }

      await Product.create({
        name: p.name,
        brand: brandId,
        description: p.description,
        price: p.price,
        volume: p.volume,
        stock: Math.floor(Math.random() * 40) + 15,
        category: p.category,
        gender: p.gender,
        scentFamily: p.scentFamily,
        concentration: p.concentration,
        notesPyramid: p.notesPyramid,
        notesTags: p.notesTags,
        images: cloudImages,
        isBestseller: p.isBestseller,
      });

      console.log(`   -> Товар ${p.name} создан (${cloudImages.length} фото).`);
    }

    console.log("\n✅ Все данные успешно загружены в Cloudinary и MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
  }
};

seedDatabase();
