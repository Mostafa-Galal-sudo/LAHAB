import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, Check, Sparkles, ArrowRight } from 'lucide-react';
import { GarmentSize } from '../types';
import { Language } from '../translations';

interface SmartFitVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectSize: (size: GarmentSize) => void;
}

export const SmartFitVisualizerModal: React.FC<SmartFitVisualizerModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectSize,
}) => {
  const isArabic = language === 'ar';

  const [heightCm, setHeightCm] = useState<number>(180);
  const [weightKg, setWeightKg] = useState<number>(78);
  const [build, setBuild] = useState<'slim' | 'athletic' | 'broad'>('athletic');
  const [drapePreference, setDrapePreference] = useState<'boxy' | 'relaxed' | 'standard'>('boxy');

  // Sizing Algorithm specifically designed for 520 GSM Heavyweight & 290 GSM Combed Drop-Shoulder Patterns
  const recommendation = useMemo(() => {
    // Base score from BMI approximation and height
    let score = heightCm * 0.4 + weightKg * 0.6;

    if (build === 'slim') score -= 6;
    if (build === 'broad') score += 8;

    if (drapePreference === 'boxy') score += 4;
    if (drapePreference === 'standard') score -= 6;

    let size: GarmentSize = 'L';
    let confidence = 94;

    if (score < 112) {
      size = 'S';
      confidence = 92;
    } else if (score < 120) {
      size = 'M';
      confidence = 95;
    } else if (score < 130) {
      size = 'L';
      confidence = 97;
    } else if (score < 140) {
      size = 'XL';
      confidence = 95;
    } else {
      size = 'XXL';
      confidence = 93;
    }

    const shoulderDropCm = drapePreference === 'boxy' ? '8 - 10 cm' : drapePreference === 'relaxed' ? '6 - 8 cm' : '4 - 5 cm';
    const chestRoom = drapePreference === 'boxy' ? '+14 cm ease' : drapePreference === 'relaxed' ? '+10 cm ease' : '+6 cm ease';
    const hemBreak = heightCm > 185 ? 'At hip bone level' : 'Slight stack above waist';

    return {
      size,
      confidence,
      shoulderDropCm,
      chestRoom,
      hemBreak,
    };
  }, [heightCm, weightKg, build, drapePreference]);

  const handleApply = () => {
    onSelectSize(recommendation.size);
    onClose();
  };

  // Hooks must run in the same order while the always-mounted modal toggles open/closed.
  if (!isOpen) return null;

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
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-[#E2E6E8]/20 bg-[#132238]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#D8A065] flex items-center justify-center bg-[#0D1929] text-[#D8A065]">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <span className="font-heading text-[10px] text-[#D8A065] tracking-[0.25em] uppercase block">
                  {isArabic ? 'حاسبة المقاسات الذكية الأرشيفية' : 'ARCHIVAL FIT & DRAPE ENGINE'}
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] tracking-wide mt-0.5">
                  {isArabic ? 'محدد المقاس والقصة التفاعلي' : 'Interactive Fit & Drape Visualizer'}
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
            {/* Left: Interactive Input Controls */}
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-[#E2E6E8]/20 bg-[#0D1929]">
              {/* Height Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-heading">
                  <span className="text-[#D8A065] uppercase tracking-wider">
                    {isArabic ? 'الطول (سم):' : 'Height (CM):'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#E2E6E8]">
                    {heightCm} cm
                  </span>
                </div>
                <input
                  type="range"
                  min={155}
                  max={205}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-[#D8A065] bg-[#132238] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#E2E6E8]/50">
                  <span>155 cm</span>
                  <span>180 cm</span>
                  <span>205 cm</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-heading">
                  <span className="text-[#D8A065] uppercase tracking-wider">
                    {isArabic ? 'الوزن (كجم):' : 'Weight (KG):'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#E2E6E8]">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={130}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-[#D8A065] bg-[#132238] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#E2E6E8]/50">
                  <span>50 kg</span>
                  <span>80 kg</span>
                  <span>130 kg</span>
                </div>
              </div>

              {/* Body Build Selector */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? 'بنية الجسم:' : 'Body Build Profile:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'slim', en: 'Lean / Slim', ar: 'نحيف / رشيق' },
                    { id: 'athletic', en: 'Athletic', ar: 'رياضي / متوسط' },
                    { id: 'broad', en: 'Broad / Solid', ar: 'عريض / ممتلئ' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBuild(b.id as any)}
                      className={`p-2.5 text-center border text-xs font-heading transition-all cursor-pointer ${
                        build === b.id
                          ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                          : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/80 hover:border-[#D8A065]/50'
                      }`}
                    >
                      {isArabic ? b.ar : b.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Drape Preference */}
              <div className="space-y-2">
                <label className="font-heading text-xs text-[#D8A065] uppercase tracking-wider block">
                  {isArabic ? 'طريقة الارتداء والقصة المفضلة:' : 'Desired Drape Profile:'}
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'boxy',
                      titleEn: 'Architectural Heavy Boxy (Recommended)',
                      titleAr: 'قصة بوكسي معمارية عريضة (المعتمدة لعلامة لَهَب)',
                      descEn: 'Significant drop shoulder, rigid chest volume, structured silhouette.',
                      descAr: 'أكتاف منسدلة بشكل واضح مع قوام عريض وثابت غير ملتصق.',
                    },
                    {
                      id: 'relaxed',
                      titleEn: 'Relaxed Streetwear Oversize',
                      titleAr: 'أوفر سايز انسيابي فضفاض',
                      descEn: 'Generous room throughout torso and arms.',
                      descAr: 'راحة وحرية حركة كاملة مع وسع متوازن.',
                    },
                    {
                      id: 'standard',
                      titleEn: 'Standard Semi-Fitted',
                      titleAr: 'قصة كلاسيكية شبه محددة',
                      descEn: 'Closer to conventional sizing lines.',
                      descAr: 'أقرب للقصات المعتادة دون انسدال مفرط.',
                    },
                  ].map((dp) => (
                    <button
                      key={dp.id}
                      onClick={() => setDrapePreference(dp.id as any)}
                      className={`w-full p-3 text-left border transition-all cursor-pointer ${
                        drapePreference === dp.id
                          ? 'border-[#D8A065] bg-[#132238] shadow-sm'
                          : 'border-[#E2E6E8]/15 bg-[#09111C] hover:border-[#D8A065]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xs font-bold text-[#D8A065]">
                          {isArabic ? dp.titleAr : dp.titleEn}
                        </span>
                        {drapePreference === dp.id && (
                          <Check className="w-3.5 h-3.5 text-[#D8A065]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#E2E6E8]/70 font-body mt-1">
                        {isArabic ? dp.descAr : dp.descEn}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Dynamic Recommender Output & Architectural Mannequin Silhouette */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-[#09111C] flex flex-col justify-between space-y-6">
              {/* Output Recommendation Card */}
              <div className="border border-[#D8A065] bg-[#0D1929] p-6 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#D8A065]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="font-heading text-[10px] tracking-[0.2em] text-[#D8A065] uppercase">
                    {isArabic ? 'المقاس الموصى به بدقة عالية' : 'CALCULATED SIZE RECOMMENDATION'}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 border border-[#D8A065]/40 text-[#D8A065] bg-[#132238]">
                    {recommendation.confidence}% FIT ACCURACY
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="font-heading text-5xl sm:text-6xl font-black text-[#D8A065] tracking-tight">
                    {recommendation.size}
                  </span>
                  <div>
                    <span className="font-heading text-sm text-[#E2E6E8] uppercase tracking-wider block">
                      {isArabic ? `المقاس المثالي (${recommendation.size})` : `SIZE ${recommendation.size} (OPTIMAL FIT)`}
                    </span>
                    <span className="text-xs text-[#E2E6E8]/70 font-body block mt-0.5">
                      {isArabic
                        ? 'مصمم بنظام الأكتاف المنسدلة المصرية الأصيلة دون الحاجة لتكبير المقاس'
                        : 'Calibrated for true drop-shoulder drape without sizing up'}
                    </span>
                  </div>
                </div>

                {/* Mannequin Silhouette Diagram */}
                <div className="pt-4 border-t border-[#E2E6E8]/15 grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 border border-[#E2E6E8]/15 bg-[#132238]/40">
                    <span className="text-[10px] font-heading text-[#D8A065] uppercase block">
                      {isArabic ? 'انسدال الكتف' : 'Shoulder Drop'}
                    </span>
                    <span className="font-mono text-xs text-[#E2E6E8] font-bold block mt-1">
                      {recommendation.shoulderDropCm}
                    </span>
                  </div>

                  <div className="p-2 border border-[#E2E6E8]/15 bg-[#132238]/40">
                    <span className="text-[10px] font-heading text-[#D8A065] uppercase block">
                      {isArabic ? 'وسع الصدر' : 'Chest Ease'}
                    </span>
                    <span className="font-mono text-xs text-[#E2E6E8] font-bold block mt-1">
                      {recommendation.chestRoom}
                    </span>
                  </div>

                  <div className="p-2 border border-[#E2E6E8]/15 bg-[#132238]/40">
                    <span className="text-[10px] font-heading text-[#D8A065] uppercase block">
                      {isArabic ? 'مستوى الطول' : 'Body Length'}
                    </span>
                    <span className="font-mono text-[11px] text-[#E2E6E8] font-bold block mt-1">
                      {isArabic ? 'عند عظم الحوض' : 'Hip Level'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fabric Behavior Explainer */}
              <div className="p-4 border border-[#E2E6E8]/15 bg-[#132238]/40 space-y-2 text-xs text-[#E2E6E8]/80">
                <div className="flex items-center gap-2 text-[#D8A065] font-heading text-xs uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'سلوك النسيج الثقيل 520 GSM' : '520 GSM Fabric Physics'}</span>
                </div>
                <p className="font-body leading-relaxed">
                  {isArabic
                    ? 'بفضل نسيج الصوف المصري بوزن 520 جرام، تحتفظ القطعة بشكلها المعماري المربع دون أن تلتصق بالجسم أو ترتخي بعد الغسيل.'
                    : 'The high-density loopback fleece creates architectural stand-off from the torso, delivering the coveted structured drape effortlessly.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleApply}
                  className="w-full btn-lahab-primary py-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>
                    {isArabic
                      ? `اعتماد مقاس (${recommendation.size}) وعرض القطع`
                      : `SELECT SIZE ${recommendation.size} & EXPLORE`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SmartFitVisualizerModal;
