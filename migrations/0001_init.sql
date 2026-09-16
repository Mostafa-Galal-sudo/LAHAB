-- Migration 0001: initial schema for LAHAB storefront + admin panel

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  nameEn TEXT NOT NULL,
  nameAr TEXT NOT NULL,
  priceEGP INTEGER NOT NULL,
  weight TEXT NOT NULL,
  fitEn TEXT NOT NULL,
  fitAr TEXT NOT NULL,
  materialEn TEXT NOT NULL,
  materialAr TEXT NOT NULL,
  descriptionEn TEXT NOT NULL,
  descriptionAr TEXT NOT NULL,
  frontDetailEn TEXT NOT NULL,
  frontDetailAr TEXT NOT NULL,
  backDetailEn TEXT NOT NULL,
  backDetailAr TEXT NOT NULL,
  sizes TEXT NOT NULL,             -- JSON array
  outOfStockSizes TEXT NOT NULL,   -- JSON array
  tagsEn TEXT NOT NULL,            -- JSON array
  tagsAr TEXT NOT NULL,            -- JSON array
  editorialImage TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  authorName TEXT NOT NULL,
  rating INTEGER NOT NULL,
  date TEXT NOT NULL,
  verifiedPurchase INTEGER NOT NULL DEFAULT 0,
  verifiedWearer INTEGER NOT NULL DEFAULT 0,
  sizePurchased TEXT,
  city TEXT,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  photos TEXT,        -- JSON array or NULL
  clientStats TEXT,   -- JSON object or NULL
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews(productId);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  deviceId TEXT NOT NULL,
  productId TEXT NOT NULL,
  size TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  UNIQUE(deviceId, productId)
);
CREATE INDEX IF NOT EXISTS idx_wishlist_deviceId ON wishlist_items(deviceId);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  deviceId TEXT NOT NULL,
  productId TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  monogramText TEXT,
  monogramPlacement TEXT,
  monogramThread TEXT,
  monogramStyle TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cart_deviceId ON cart_items(deviceId);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiryType TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  emailStatus TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- Simple sliding-window rate limit counters (used instead of Express middleware)
CREATE TABLE IF NOT EXISTS rate_limits (
  bucketKey TEXT PRIMARY KEY,   -- e.g. "contact:1.2.3.4"
  windowStart TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0
);

-- Seed the Drop 01 hoodie (migrated from the old hardcoded frontend array)
INSERT OR IGNORE INTO products (
  id, code, nameEn, nameAr, priceEGP, weight, fitEn, fitAr, materialEn, materialAr,
  descriptionEn, descriptionAr, frontDetailEn, frontDetailAr, backDetailEn, backDetailAr,
  sizes, outOfStockSizes, tagsEn, tagsAr, editorialImage, sortOrder, createdAt, updatedAt
) VALUES (
  'hoodie-01',
  'DROP 01 // PIECE 01',
  'LAHAB HEAVYWEIGHT HOODIE',
  'هودي لَهَب المعماري الثقيل',
  2450,
  '520 GSM FLEECE',
  'Boxy Drop-Shoulder Silhouette',
  'قصة عريضة بأكتاف ساقطة',
  '100% French Terry Cotton, High-Density Thread Embroidery',
  'قطن فرينش تيري 100%، تطريز بخيوط عالية الكثافة',
  'Engineered from ultra-dense 520 GSM French Terry in night navy. Features the LΛHΛB wordmark embroidered in matte gold thread across the chest, with monumental flame calligraphy printed across the broad back.',
  'مصنوع من نسيج فرينش تيري فائق الكثافة بوزن 520 جرام بلون كحلي ليلي عميق. يتميز بكلمة LΛHΛB مطرزة بخيوط ذهبية مطفية على الصدر مع طباعة خلفية فخمة تمثل طاقة اللهب.',
  'LΛHΛB CHEST EMBROIDERY (MATTE GOLD THREAD)',
  'تطريز الصدر LΛHΛB (خيوط ذهبية مطفية)',
  'FLAME CALLIGRAPHY SILHOUETTE (LARGE PRINT)',
  'طباعة خلفية كاملة لحروف اللهب الأرشيفية',
  '["S","M","L","XL","XXL"]',
  '["S","XXL"]',
  '["Limited Edition","520 GSM Fleece","Ethically Made","Gold Thread"]',
  '["إصدار محدود","صوف 520 جرام","صناعة أخلاقية","تطريز ذهبي"]',
  '/assets/images/streetwear_editorial_1788904807341.jpg',
  0,
  datetime('now'),
  datetime('now')
);
