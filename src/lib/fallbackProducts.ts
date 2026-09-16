import { ProductItem } from '../types';
import archerHoodie from '../assets/images/lahab_drop01_archer_hoodie.png';
import streetwearEditorial from '../assets/images/streetwear_editorial_1788904807341.jpg';
import streetwearTee from '../assets/images/streetwear_tee_1788904820416.jpg';

export const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'hoodie-01',
    code: 'LHB-01-HOODIE',
    name: {
      en: 'Drop 01 Flame Archer Heavyweight Hoodie (520 GSM)',
      ar: 'هودي رامي القوس الناري - الإصدار الأول (520 GSM)',
    },
    priceEGP: 4850,
    weight: '520 GSM Sand Loopback Fleece',
    fit: {
      en: 'Boxy Drop-Shoulder Oversized',
      ar: 'قصة واسعة بأكتاف ساقطة معمارية',
    },
    material: {
      en: '100% Giza 86 Extra-Long Staple Egyptian Cotton',
      ar: 'قطن مصري أصيل 100% جيزة 86 فائق الطول والتيلة',
    },
    description: {
      en: 'Monumental sand-beige 520 GSM loopback French terry hoodie engineered with boxy drop-shoulder proportions, double-lined zero-sag hood, and signature crimson flame archer emblem on the back.',
      ar: 'هودي باللون الرملي البيج بوزن 520 جرام من صوف فرينش تيري المصري الفاخر، مزين بطباعة رامي القوس الناري القرمزية الأرشيفية على الظهر وياقة متينة مزدوجة.',
    },
    frontDetail: {
      en: 'Minimal gold chest diacritic embroidery',
      ar: 'تطريز الحركات العربية بخيط الذهب المطفي',
    },
    backDetail: {
      en: 'Crimson Flame Archer Circle Emblem Print',
      ar: 'طباعة رامي القوس وشعار شعلة اللهب القرمزية على الظهر',
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: ['S'],
    tags: {
      en: ['520 GSM Loopback', 'Flame Archer Emblem', 'Giza 86 Cotton'],
      ar: ['صوف 520 جرام', 'شعار رامي القوس', 'قطن جيزة 86'],
    },
    editorialImage: archerHoodie,
  },
  {
    id: 'tee-01',
    code: 'LHB-01-TEE',
    name: {
      en: 'Flame Calligraphy Heavyweight Tee (320 GSM)',
      ar: 'تيشيرت حروف اللهب الثقيل (320 GSM)',
    },
    priceEGP: 2450,
    weight: '320 GSM Single Jersey',
    fit: {
      en: 'Structured Oversized Street Cut',
      ar: 'قصة ستريت وير عريضة ومحددة',
    },
    material: {
      en: '100% Giza 86 Egyptian Combed Cotton',
      ar: 'قطن مصري ممشط 100% جيزة 86',
    },
    description: {
      en: 'Dense 320 GSM single jersey cotton tee with structured high ribbed collar, dropped shoulder seams, and subtle gold medallion print on the left sleeve.',
      ar: 'تيشيرت نسيج ثقيل 320 جرام مع ياقة مضلعة سميكة وأكتاف ساقطة وشعار الميدالية الذهبية المنقوش على الكم الأيسر.',
    },
    frontDetail: {
      en: 'Minimal gold crest logo on left chest',
      ar: 'شعار لهَب الذهبي الناعم على الصدر',
    },
    backDetail: {
      en: 'High-density puff flame calligraphy text',
      ar: 'طباعة بارزة لحروف لهَب النارية على الظهر',
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    outOfStockSizes: [],
    tags: {
      en: ['320 GSM Jersey', 'High Rib Collar', 'Giza 86 Cotton'],
      ar: ['نسيج 320 جرام', 'ياقة سميكة', 'قطن جيزة 86'],
    },
    editorialImage: streetwearTee,
  },
];
