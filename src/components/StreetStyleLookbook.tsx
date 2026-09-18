import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowUpRight, Camera, UserCheck } from 'lucide-react';
import { ProductItem, GarmentSize, ProductId } from '../types';
import { Language } from '../translations';
import streetwearEditorial from '../assets/images/streetwear_editorial_1788904807341.jpg';

interface StreetStyleLookbookProps {
  language: Language;
  onShopLook: (productId: ProductId, size: GarmentSize) => void;
  schemaContent?: { badge: string; title: string };
}

interface StreetLook {
  id: string;
  cityEn: string;
  cityAr: string;
  locationEn: string;
  locationAr: string;
  image: string;
  productId: ProductId;
  productNameEn: string;
  productNameAr: string;
  sizeWorn: GarmentSize;
  modelEn: string;
  modelAr: string;
  modelStats: string;
  stylingNotesEn: string;
  stylingNotesAr: string;
}

export const StreetStyleLookbook: React.FC<StreetStyleLookbookProps> = ({
  language,
  onShopLook,
  schemaContent,
}) => {
  const isArabic = language === 'ar';
  const [activeFilter, setActiveFilter] = useState<'all' | 'cairo' | 'dubai' | 'london'>('all');

  const looks: StreetLook[] = [
    {
      id: 'look-01',
      cityEn: 'Cairo',
      cityAr: 'القاهرة',
      locationEn: 'Downtown Cairo / Kodak Pass',
      locationAr: 'وسط البلد / ممر كوداك التاريخي',
      image: streetwearEditorial,
      productId: 'hoodie-01',
      productNameEn: 'Drop 01 Heavyweight Hoodie (520 GSM)',
      productNameAr: 'هودي الإصدار الأول فائق الثقل (520 GSM)',
      sizeWorn: 'XL',
      modelEn: 'Omar K.',
      modelAr: 'عمر ك.',
      modelStats: '184 cm // 82 kg',
      stylingNotesEn: 'Paired with wide-leg raw Japanese denim, structured leather boots, and minimal gold band.',
      stylingNotesAr: 'تنسيق مع بنطال دنيم ياباني عريض وأحذية جلدية متينة وخاتم ذهبي كلاسيكي.',
    },
    {
      id: 'look-02',
      cityEn: 'Cairo',
      cityAr: 'القاهرة',
      locationEn: 'Zamalek Nile Terrace',
      locationAr: 'شرفة الزمالك المطلة على النيل',
      image: streetwearEditorial,
      productId: 'hoodie-01',
      productNameEn: 'Drop 01 Heavyweight Hoodie (520 GSM)',
      productNameAr: 'هودي الإصدار الأول فائق الثقل (520 GSM)',
      sizeWorn: 'M',
      modelEn: 'Nour E.',
      modelAr: 'نور ع.',
      modelStats: '176 cm // 68 kg',
      stylingNotesEn: 'Fitted tailored drape paired with pleat charcoal trousers and vintage signet rings.',
      stylingNotesAr: 'قصة انسيابية أنيقة مع بنطال قماشي رمادي ذو كسرات مع خواتم أثرية عتيقة.',
    },
    {
      id: 'look-03',
      cityEn: 'Dubai',
      cityAr: 'دبي',
      locationEn: 'Alserkal Avenue Contemporary Hub',
      locationAr: 'حي السركال أفينيو للفنون',
      image: streetwearEditorial,
      productId: 'hoodie-01',
      productNameEn: 'Drop 01 Heavyweight Hoodie (520 GSM)',
      productNameAr: 'هودي الإصدار الأول فائق الثقل (520 GSM)',
      sizeWorn: 'XXL',
      modelEn: 'Zaid A.',
      modelAr: 'زيد ع.',
      modelStats: '188 cm // 91 kg',
      stylingNotesEn: 'High-volume architectural streetwear silhouette layered with cropped nylon vest.',
      stylingNotesAr: 'قوام ستريت وير عريض مع سترة نايلون قصيرة لإبراز تباين الخامات.',
    },
    {
      id: 'look-04',
      cityEn: 'London',
      cityAr: 'لندن',
      locationEn: 'Shoreditch Redbrick Industrial',
      locationAr: 'شوردتش / الطوب الأحمر الصناعي',
      image: streetwearEditorial,
      productId: 'hoodie-01',
      productNameEn: 'Drop 01 Heavyweight Hoodie (520 GSM)',
      productNameAr: 'هودي الإصدار الأول فائق الثقل (520 GSM)',
      sizeWorn: 'L',
      modelEn: 'Salma T.',
      modelAr: 'سلمى ط.',
      modelStats: '172 cm // 62 kg',
      stylingNotesEn: 'Clean minimalist drape highlighting the matte gold diacritic chest embroidery.',
      stylingNotesAr: 'قصة مينيمال أنيقة تبرز تطريز الصدر الذهبي المطفي بدقة متناهية.',
    },
  ];

  const filteredLooks = looks.filter((look) => {
    if (activeFilter === 'all') return true;
    return look.cityEn.toLowerCase() === activeFilter;
  });

  return (
    <section
      id="street-style"
      className="bg-[#0D1929] text-[#E2E6E8] px-4 sm:px-8 lg:px-16 py-20 sm:py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-12 border-b border-[#E2E6E8]/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-[#D8A065]" />
              <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                {schemaContent?.badge || (isArabic ? 'مجتمع لَهَب // SEEN IN LAHAB' : 'SEEN IN LΛHΛB // ARCHIVAL STREET-STYLE')}
              </span>
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl text-[#D8A065] uppercase tracking-wide">
              {schemaContent?.title || (isArabic ? 'أناقة الشارع وتنسيق القطع' : 'Community Lookbook')}
            </h2>
          </div>

          {/* City Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', en: 'All Hubs', ar: 'كافة المدن' },
              { id: 'cairo', en: 'Cairo', ar: 'القاهرة' },
              { id: 'dubai', en: 'Dubai', ar: 'دبي' },
              { id: 'london', en: 'London', ar: 'لندن' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-4 py-1.5 text-xs font-heading uppercase tracking-wider border transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                    : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/70 hover:border-[#D8A065]/50'
                }`}
              >
                {isArabic ? f.ar : f.en}
              </button>
            ))}
          </div>
        </div>

        {/* Street-Style Lookbook Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredLooks.map((look) => (
            <div
              key={look.id}
              className="group border border-[#E2E6E8]/20 bg-[#132238]/40 overflow-hidden hover:border-[#D8A065]/60 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Canvas with Location Badge */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#070D14]">
                <img
                  src={look.image}
                  alt={isArabic ? look.locationAr : look.locationEn}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
                  referrerPolicy="no-referrer"
                />

                {/* Location Overlay Badge */}
                <div className="absolute top-4 left-4 bg-[#0D1929]/90 border border-[#D8A065] px-3 py-1 text-[11px] font-heading text-[#D8A065] flex items-center gap-1.5 backdrop-blur-md">
                  <MapPin className="w-3 h-3" />
                  <span>{isArabic ? look.locationAr : look.locationEn}</span>
                </div>

                {/* Size Worn Pill */}
                <div className="absolute bottom-4 right-4 bg-[#0D1929]/95 border border-[#E2E6E8]/30 px-3 py-1 text-[11px] font-mono text-[#E2E6E8] flex items-center gap-2 backdrop-blur-md">
                  <UserCheck className="w-3.5 h-3.5 text-[#D8A065]" />
                  <span>
                    {isArabic ? look.modelAr : look.modelEn} ({isArabic ? `المقاس: ${look.sizeWorn}` : `Wears: Size ${look.sizeWorn}`})
                  </span>
                </div>
              </div>

              {/* Look Info & Styling Notes */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#E2E6E8]/60 font-mono">
                    <span>{look.modelStats}</span>
                    <span className="text-[#D8A065] font-bold">100% EGYPTIAN COTTON</span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-xl text-[#E2E6E8] uppercase tracking-wide">
                    {isArabic ? look.productNameAr : look.productNameEn}
                  </h3>

                  <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/70 leading-relaxed">
                    {isArabic ? look.stylingNotesAr : look.stylingNotesEn}
                  </p>
                </div>

                {/* Shop This Exact Look CTA Button */}
                <div className="pt-4 border-t border-[#E2E6E8]/15 flex items-center justify-between">
                  <button
                    onClick={() => onShopLook(look.productId, look.sizeWorn)}
                    className="w-full btn-lahab-outline py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer group-hover:bg-[#D8A065] group-hover:text-[#0D1929] transition-all"
                  >
                    <span>
                      {isArabic
                        ? `تسوق هذه الإطلالة بمقاس (${look.sizeWorn})`
                        : `SHOP THIS PIECE (SIZE ${look.sizeWorn})`}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StreetStyleLookbook;
