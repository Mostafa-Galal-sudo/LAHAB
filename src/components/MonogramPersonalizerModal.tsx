import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Scissors } from 'lucide-react';
import { ProductItem, GarmentSize, MonogramCustomization } from '../types';
import { Language } from '../translations';

interface MonogramPersonalizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  selectedProduct: ProductItem;
  initialSize: GarmentSize;
  language: Language;
  onAddCustomizedToBag: (
    product: ProductItem,
    size: GarmentSize,
    customization: MonogramCustomization
  ) => void;
}

export const MonogramPersonalizerModal: React.FC<MonogramPersonalizerModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProduct: initialProduct,
  initialSize,
  language,
  onAddCustomizedToBag,
}) => {
  const isArabic = language === 'ar';
  const [activeProduct, setActiveProduct] = useState<ProductItem>(initialProduct);
  const [activeSize, setActiveSize] = useState<GarmentSize>(initialSize);
  const [monogramText, setMonogramText] = useState('LH');
  const [placement, setPlacement] = useState<'chest' | 'cuff' | 'nape'>('chest');
  const [threadColor, setThreadColor] = useState<'gold' | 'silver' | 'bronze'>('gold');
  const [fontStyle, setFontStyle] = useState<'geometric' | 'calligraphy'>('geometric');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const threadColors = {
    gold: {
      name: isArabic ? 'ذهب مطفي فاخر (Matte Gold)' : 'Matte Archival Gold',
      hex: '#D8A065',
      glow: 'rgba(216, 160, 101, 0.4)',
      accent: '#F2C892',
    },
    silver: {
      name: isArabic ? 'فضة استرلينية خام (Raw Silver)' : 'Raw Sterling Silver',
      hex: '#E2E6E8',
      glow: 'rgba(226, 230, 232, 0.35)',
      accent: '#FFFFFF',
    },
    bronze: {
      name: isArabic ? 'برونز أرشيفي عتيق (Antique Bronze)' : 'Antique Bronze',
      hex: '#B8860B',
      glow: 'rgba(184, 134, 11, 0.4)',
      accent: '#D4AF37',
    },
  };

  const handleApplyAndAdd = () => {
    if (!monogramText.trim()) return;
    onAddCustomizedToBag(activeProduct, activeSize, {
      text: monogramText.trim().toUpperCase(),
      placement,
      thread: threadColor,
      style: fontStyle,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#070D14]/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#0D1929] border border-[#D8A065]/50 shadow-2xl overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-[#E2E6E8]/20 bg-[#132238]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#D8A065] flex items-center justify-center bg-[#0D1929] text-[#D8A065]">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <span className="font-heading text-[10px] text-[#D8A065] tracking-[0.25em] uppercase block">
                  {isArabic ? 'مشغل التطريز الخاص // ATELIER BESPOKE' : 'ATELIER BESPOKE EMBROIDERY'}
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] tracking-wide mt-0.5">
                  {isArabic ? 'تخصيص التطريز بالخيوط الذهبية' : 'Personalized Monogram & Stitch'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#E2E6E8]/70 hover:text-[#D8A065] border border-transparent hover:border-[#D8A065]/40 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Interactive Live Mockup Preview Canvas */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-[#09111C] border-b lg:border-b-0 lg:border-r border-[#E2E6E8]/20 flex flex-col items-center justify-between relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-heading text-[#D8A065]">
                <span className="tracking-wider uppercase">
                  {isArabic ? 'معاينة الغرز المباشرة' : 'LIVE STITCH PREVIEW'}
                </span>
                <span className="text-[11px] text-[#E2E6E8]/60 font-mono">
                  {placement.toUpperCase()} // {threadColor.toUpperCase()}
                </span>
              </div>

              {/* Garment Silhouette with Embroidered Monogram Overlay */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] my-6 flex items-center justify-center">
                {/* Garment Base Representation */}
                <svg
                  viewBox="0 0 400 480"
                  className="w-full h-full drop-shadow-2xl select-none"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="monogram-fabric-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#172437" />
                      <stop offset="50%" stopColor="#0F1B2B" />
                      <stop offset="100%" stopColor="#0B131F" />
                    </linearGradient>

                    {/* Thread Embroidery Filter Effect */}
                    <filter id="thread-glow">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={threadColors[threadColor].hex} floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Body Silhouette */}
                  <path
                    d="M130 50 L270 50 L370 120 L330 190 L290 160 L290 440 L110 440 L110 160 L70 190 L30 120 Z"
                    fill="url(#monogram-fabric-grad)"
                    stroke="#D8A065"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />

                  {/* Collar / Neck Ribbing */}
                  <path
                    d="M140 50 C140 85, 260 85, 260 50"
                    stroke="#D8A065"
                    strokeWidth="3"
                    strokeOpacity="0.6"
                    fill="none"
                  />

                  {/* Hood outline if hoodie */}
                  {activeProduct.id === 'hoodie-01' && (
                    <path
                      d="M140 50 C120 15, 280 15, 260 50"
                      stroke="#D8A065"
                      strokeWidth="2"
                      strokeOpacity="0.5"
                      strokeDasharray="4 2"
                      fill="none"
                    />
                  )}

                  {/* LΛHΛB Base Chest Print Marker */}
                  <text
                    x="160"
                    y="150"
                    fill="#D8A065"
                    fillOpacity="0.25"
                    fontSize="11"
                    fontFamily="Cinzel, serif"
                    letterSpacing="4"
                  >
                    LΛHΛB
                  </text>

                  {/* Dynamic Custom Monogram Stitch Position */}
                  {placement === 'chest' && (
                    <g transform="translate(155, 175)" filter="url(#thread-glow)">
                      <rect
                        x="-10"
                        y="-16"
                        width="80"
                        height="26"
                        fill="none"
                        stroke={threadColors[threadColor].hex}
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        opacity="0.5"
                      />
                      <text
                        x="0"
                        y="0"
                        fill={threadColors[threadColor].hex}
                        fontSize="15"
                        fontWeight="700"
                        fontFamily={fontStyle === 'calligraphy' ? 'Amiri, serif' : 'Cinzel, monospace'}
                        letterSpacing={fontStyle === 'calligraphy' ? '1' : '3'}
                      >
                        {monogramText || 'LH'}
                      </text>
                    </g>
                  )}

                  {placement === 'cuff' && (
                    <g transform="translate(60, 160)" filter="url(#thread-glow)">
                      <rect
                        x="-6"
                        y="-14"
                        width="46"
                        height="22"
                        fill="none"
                        stroke={threadColors[threadColor].hex}
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        opacity="0.5"
                      />
                      <text
                        x="0"
                        y="0"
                        fill={threadColors[threadColor].hex}
                        fontSize="12"
                        fontWeight="700"
                        fontFamily={fontStyle === 'calligraphy' ? 'Amiri, serif' : 'Cinzel, monospace'}
                        letterSpacing="2"
                      >
                        {monogramText || 'LH'}
                      </text>
                    </g>
                  )}

                  {placement === 'nape' && (
                    <g transform="translate(180, 80)" filter="url(#thread-glow)">
                      <rect
                        x="-15"
                        y="-14"
                        width="45"
                        height="22"
                        fill="none"
                        stroke={threadColors[threadColor].hex}
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        opacity="0.5"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill={threadColors[threadColor].hex}
                        fontSize="11"
                        fontWeight="700"
                        fontFamily={fontStyle === 'calligraphy' ? 'Amiri, serif' : 'Cinzel, monospace'}
                        letterSpacing="2"
                      >
                        {monogramText || 'LH'}
                      </text>
                    </g>
                  )}
                </svg>

                {/* Simulated Stitch Magnifier Badge */}
                <div className="absolute bottom-1 right-1 bg-[#132238]/90 border border-[#D8A065]/50 px-3 py-1 text-[10px] font-mono text-[#D8A065] shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-[#D8A065]" />
                  <span>14,000 DENSITY STITCHES</span>
                </div>
              </div>

              <div className="w-full text-center text-xs text-[#E2E6E8]/70 font-body">
                {isArabic
                  ? 'يتم تطبيق التطريز يدوياً على نسيج القطن المصري فائق الكثافة في القاهرة.'
                  : 'Embroidered in Cairo using reinforced gold-foil wound spun filaments.'}
              </div>
            </div>

            {/* Right: Customization Controls Form */}
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-6">
              {/* Garment Selector */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? '1. اختيار القطعة' : '1. Select Piece'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {products.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => setActiveProduct(prod)}
                      className={`p-2.5 text-left border transition-all text-xs font-heading cursor-pointer ${
                        activeProduct.id === prod.id
                          ? 'border-[#D8A065] bg-[#D8A065]/15 text-[#E2E6E8]'
                          : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/70 hover:border-[#D8A065]/50'
                      }`}
                    >
                      <span className="block font-bold text-[11px] text-[#D8A065]">
                        {prod.code}
                      </span>
                      <span className="truncate block">{prod.name[language]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? '2. اختيار المقاس' : '2. Select Size'}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {activeProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setActiveSize(sz)}
                      className={`py-2 text-xs font-bold font-heading border transition-all cursor-pointer ${
                        activeSize === sz
                          ? 'bg-[#D8A065] text-[#0D1929] border-[#D8A065]'
                          : 'bg-[#0D1929] text-[#E2E6E8] border-[#E2E6E8]/30 hover:border-[#D8A065]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monogram Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? '3. الحروف أو الكلمة (حتى 6 أحرف)' : '3. Monogram Initials (Up to 6 Chars)'}
                  </label>
                  <span className="text-[10px] font-mono text-[#E2E6E8]/60">
                    {monogramText.length}/6
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={monogramText}
                  onChange={(e) => setMonogramText(e.target.value.slice(0, 6))}
                  placeholder="e.g. LH / ك / LΛ"
                  className="w-full bg-[#132238]/80 border border-[#E2E6E8]/30 px-4 py-2.5 text-base font-mono font-bold text-[#E2E6E8] focus:outline-none focus:border-[#D8A065] transition-colors uppercase"
                />
              </div>

              {/* Placement Options */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? '4. موضع التطريز' : '4. Embroidery Placement'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'chest', en: 'Left Chest', ar: 'الصدر الأيسر' },
                    { id: 'cuff', en: 'Sleeve Cuff', ar: 'معصم الكم' },
                    { id: 'nape', en: 'Back Nape', ar: 'ياقة الظهر' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setPlacement(loc.id as any)}
                      className={`p-2 text-center border text-xs font-heading transition-all cursor-pointer ${
                        placement === loc.id
                          ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                          : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/80 hover:border-[#D8A065]/60'
                      }`}
                    >
                      {isArabic ? loc.ar : loc.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread Color Selection */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? '5. لون ونوع خيط التطريز' : '5. Thread Finish & Tone'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['gold', 'silver', 'bronze'] as const).map((clr) => (
                    <button
                      key={clr}
                      onClick={() => setThreadColor(clr)}
                      className={`p-2.5 border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        threadColor === clr
                          ? 'border-[#D8A065] bg-[#132238]'
                          : 'border-[#E2E6E8]/20 bg-[#0D1929] hover:border-[#D8A065]/50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: threadColors[clr].hex }}
                      />
                      <span className="text-[10px] font-heading text-[#E2E6E8] uppercase text-center">
                        {clr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? '6. نمط الخط' : '6. Typographic Style'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFontStyle('geometric')}
                    className={`py-2 px-3 border text-xs font-heading cursor-pointer transition-all ${
                      fontStyle === 'geometric'
                        ? 'border-[#D8A065] bg-[#D8A065]/20 text-[#D8A065] font-bold'
                        : 'border-[#E2E6E8]/20 text-[#E2E6E8]/70 hover:border-[#D8A065]/50'
                    }`}
                  >
                    {isArabic ? 'هندسي أرشيفي (Archival Sans)' : 'Archival Geometric'}
                  </button>
                  <button
                    onClick={() => setFontStyle('calligraphy')}
                    className={`py-2 px-3 border text-xs font-heading cursor-pointer transition-all ${
                      fontStyle === 'calligraphy'
                        ? 'border-[#D8A065] bg-[#D8A065]/20 text-[#D8A065] font-bold'
                        : 'border-[#E2E6E8]/20 text-[#E2E6E8]/70 hover:border-[#D8A065]/50'
                    }`}
                  >
                    {isArabic ? 'خط عربي كوفي (Calligraphic)' : 'Calligraphic Script'}
                  </button>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-4 border-t border-[#E2E6E8]/20 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-heading">
                  <span className="text-[#E2E6E8]/80">
                    {isArabic ? 'سعر الخدمة الحرفية الإضافية:' : 'Atelier Monogram Service:'}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#D8A065]">
                    +350 EGP ({isArabic ? '٣٥٠ ج.م' : '350 EGP'})
                  </span>
                </div>

                <button
                  onClick={handleApplyAndAdd}
                  disabled={!monogramText.trim()}
                  className="w-full btn-lahab-primary py-4 text-xs font-bold flex items-center justify-center gap-3 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSaved ? (
                    <span className="flex items-center gap-2 font-bold">
                      <Check className="w-4 h-4" />
                      {isArabic ? 'تمت إضافة القطعة المخصصة للحقيبة!' : 'CUSTOMIZED PIECE ADDED TO BAG!'}
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isArabic
                          ? `إضافة القطعة المطرزة للحقيبة (${(activeProduct.priceEGP + 350).toLocaleString('ar-EG')} ج.م)`
                          : `ADD BESPOKE PIECE TO BAG (${(activeProduct.priceEGP + 350).toLocaleString()} EGP)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MonogramPersonalizerModal;
