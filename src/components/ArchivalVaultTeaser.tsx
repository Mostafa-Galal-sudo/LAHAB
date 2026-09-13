import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, Sparkles, BellRing, ArrowRight, Check } from 'lucide-react';
import { Language } from '../translations';

interface ArchivalVaultTeaserProps {
  language: Language;
}

export const ArchivalVaultTeaser: React.FC<ArchivalVaultTeaserProps> = ({ language }) => {
  const isArabic = language === 'ar';
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [waitlistInput, setWaitlistInput] = useState('');
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);

  // Live Countdown Timer state targeting Drop 02 VIP Release
  const [timeLeft, setTimeLeft] = useState({ days: 28, hours: 14, minutes: 32, seconds: 45 });

  React.useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 28);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleUnlockWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toUpperCase();
    if (clean === 'LAHABLTD' || clean === 'DROP02' || clean === 'VIP' || clean === 'SAHAR') {
      setIsUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage(
        isArabic
          ? 'رمز VIP غير صحيح. جرب كود: DROP02 أو LAHABLTD'
          : 'Invalid VIP pass. Try hint code: DROP02 or LAHABLTD'
      );
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistInput.trim()) return;
    setIsWaitlistSubmitted(true);
    setIsUnlocked(true);
  };

  const upcomingPieces = [
    {
      id: 'drop2-01',
      code: 'LHB-02-PANT',
      nameEn: 'Architectural Tapered Cargo Pant',
      nameAr: 'بنطال كارجو معمارى مدبب فائق المتانة',
      weight: '480 GSM Structured Egyptian Twill',
      detailsEn: 'Articulated knee darts, 6 concealed flap pockets, matte brass cinch buckles.',
      detailsAr: 'ثنيات ركبة مفصلية مع 6 جيوب مخفية وإبزيم نحاسي مطفي.',
      statusEn: 'PROTOTYPE APPROVED // 150 UNITS',
      statusAr: 'تم اعتماد العينة // ١٥٠ قطعة فقط',
    },
    {
      id: 'drop2-02',
      code: 'LHB-02-SHORT',
      nameEn: 'Raw-Edge French Terry Heavy Short',
      nameAr: 'شورت صوف فرنسي ثقيل بحواف خام',
      weight: '520 GSM Loopback Fleece',
      detailsEn: 'Hand-distressed raw leg hem, deep side welts, extended flat cotton drawstrings.',
      detailsAr: 'حواف أرجل خام منسولة يدوياً مع أربطة قطنية عريضة ممتدة.',
      statusEn: 'IN WEAVING // 120 UNITS',
      statusAr: 'قيد النسيج بالمحلة // ١٢٠ قطعة فقط',
    },
    {
      id: 'drop2-03',
      code: 'LHB-02-BEANIE',
      nameEn: 'Chunky Ribbed Beanie w/ Brass Ingot',
      nameAr: 'قبعة صوفية مضلعة مع سبيكة نحاسية',
      weight: '100% Combed Cotton 4-Ply Rib',
      detailsEn: 'Custom engraved mini-ingot riveted on cuff, heavyweight zero-itch yarn.',
      detailsAr: 'سبيكة معدنية مصغرة منقوشة على الحافة، خيوط ناعمة خالية من الحكة.',
      statusEn: 'ATELIER FINISHING // 80 UNITS',
      statusAr: 'اللمسات النهائية // ٨٠ قطعة فقط',
    },
  ];

  return (
    <section
      id="vault"
      className="bg-[#070D14] text-[#E2E6E8] px-4 sm:px-8 lg:px-16 py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 border border-[#D8A065]/40 px-3 py-1 bg-[#132238]/60 text-xs font-heading text-[#D8A065] tracking-widest uppercase">
            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isArabic ? 'خزينة الأرشيف القادم' : 'ARCHIVAL VAULT // DROP 02'}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl text-[#D8A065] uppercase tracking-wide">
            {isArabic ? 'الإصدار الثاني // [مخفي]' : 'Drop 02: [REDACTED]'}
          </h2>

          <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/70 max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? 'معاينة سرية وحصرية للقطع المعمارية القادمة من علامة لَهَب. أدخل رمز VIP الخاص بك أو سجل بياناتك لفتح المخططات.'
              : 'Classified early look at our upcoming dawn silhouette capsule. Unlock the blueprints with your VIP pass or register for early allocation privileges.'}
          </p>

          {/* Live Countdown Digit Boxes */}
          <div className="pt-4 flex items-center justify-center gap-3 sm:gap-4 font-mono select-none">
            {[
              { label: isArabic ? 'يوم' : 'DAYS', val: timeLeft.days },
              { label: isArabic ? 'ساعة' : 'HOURS', val: timeLeft.hours },
              { label: isArabic ? 'دقيقة' : 'MIN', val: timeLeft.minutes },
              { label: isArabic ? 'ثانية' : 'SEC', val: timeLeft.seconds },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="bg-[#0D1929] border border-[#D8A065]/60 px-3 sm:px-5 py-2 sm:py-3 text-center min-w-16.25 sm:min-w-20 shadow-lg"
              >
                <span className="font-heading text-2xl sm:text-4xl text-[#D8A065] font-bold block">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-heading text-[#E2E6E8]/60 uppercase tracking-widest block mt-0.5">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Overlay or Unlocked Vault Grid */}
        <div className="relative">
          {/* Products Grid (blurred if locked) */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${
              !isUnlocked ? 'filter blur-md pointer-events-none select-none opacity-40' : 'opacity-100'
            }`}
          >
            {upcomingPieces.map((piece) => (
              <div
                key={piece.id}
                className="border border-[#D8A065]/40 bg-[#0D1929] p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#D8A065] font-bold">
                      {piece.code}
                    </span>
                    <span className="text-[10px] font-heading px-2 py-0.5 border border-[#E2E6E8]/20 bg-[#132238] text-[#E2E6E8]/80">
                      {isArabic ? piece.statusAr : piece.statusEn}
                    </span>
                  </div>

                  {/* Blueprint Technical Mockup Placeholder Box */}
                  <div className="aspect-4/3 bg-[#09111C] border border-dashed border-[#D8A065]/30 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#D8A065_1px,transparent_1px)] bg-size-[16px_16px] opacity-15" />
                    <Sparkles className="w-6 h-6 text-[#D8A065] mb-2 relative z-10" />
                    <span className="font-heading text-xs text-[#E2E6E8] uppercase tracking-wider relative z-10">
                      {isArabic ? piece.nameAr : piece.nameEn}
                    </span>
                    <span className="text-[10px] font-mono text-[#D8A065] mt-1 relative z-10">
                      {piece.weight}
                    </span>
                  </div>

                  <h3 className="font-heading text-base text-[#E2E6E8] uppercase tracking-wide">
                    {isArabic ? piece.nameAr : piece.nameEn}
                  </h3>

                  <p className="font-body text-xs text-[#E2E6E8]/70 leading-relaxed">
                    {isArabic ? piece.detailsAr : piece.detailsEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E6E8]/15 flex items-center justify-between text-[11px] font-mono text-[#D8A065]">
                  <span>{isArabic ? 'إصدار محدود مرقم' : 'LIMITED SERIALIZED'}</span>
                  <span>FALL / WINTER 2026</span>
                </div>
              </div>
            ))}
          </div>

          {/* Locked Gateway Card overlaying the grid */}
          <AnimatePresence>
            {!isUnlocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-lg bg-[#0D1929]/95 border-2 border-[#D8A065] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center space-y-6 backdrop-blur-xl">
                  <div className="w-14 h-14 rounded-full border-2 border-[#D8A065] flex items-center justify-center mx-auto text-[#D8A065] bg-[#132238]">
                    <KeyRound className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] uppercase tracking-wide">
                      {isArabic ? 'الخزينة مشفرة لأعضاء VIP' : 'VAULT ENCRYPTED // VIP ACCESS ONLY'}
                    </h3>
                    <p className="font-body text-xs text-[#E2E6E8]/70">
                      {isArabic
                        ? 'أدخل رمز المرور الخاص بك أو سجل بريدك لتأكيد حجزك في قائمة أسبقية الإصدار الثاني.'
                        : 'Enter your exclusive client passcode or submit your email/phone to gain immediate blueprint clearance.'}
                    </p>
                  </div>

                  {/* Passcode Entry Form */}
                  <form onSubmit={handleUnlockWithCode} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          setErrorMessage('');
                        }}
                        placeholder={isArabic ? 'أدخل كود VIP (مثال: DROP02)' : 'Enter VIP Code (e.g. DROP02)'}
                        className="flex-1 bg-[#132238] border border-[#E2E6E8]/30 px-4 py-3 text-sm font-mono font-bold text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065] uppercase"
                      />
                      <button
                        type="submit"
                        className="btn-lahab-primary px-6 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'فتح' : 'UNLOCK'}</span>
                      </button>
                    </div>

                    {errorMessage && (
                      <span className="text-red-400 text-xs font-body block">{errorMessage}</span>
                    )}

                    <div className="text-[11px] font-mono text-[#D8A065]">
                      {isArabic ? 'كود تجريبي مقترح: DROP02 أو LAHABLTD' : 'Hint Passcode: DROP02 or LAHABLTD'}
                    </div>
                  </form>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#E2E6E8]/20 w-full" />
                    <span className="bg-[#0D1929] px-3 text-[10px] font-heading text-[#E2E6E8]/50 uppercase tracking-widest absolute">
                      {isArabic ? 'أو' : 'OR REGISTER INSTANTLY'}
                    </span>
                  </div>

                  {/* Instant VIP Waitlist Input */}
                  <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={waitlistInput}
                        onChange={(e) => setWaitlistInput(e.target.value)}
                        placeholder={isArabic ? 'رقم الهاتف أو البريد الإلكتروني' : 'Phone or Email for VIP access'}
                        className="flex-1 bg-[#132238] border border-[#E2E6E8]/30 px-4 py-3 text-xs text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065]"
                      />
                      <button
                        type="submit"
                        className="btn-lahab-outline px-6 py-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#D8A065] hover:text-[#0D1929]"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'انضمام' : 'JOIN'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unlocked Congratulation Message */}
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-[#D8A065] bg-[#132238]/60 text-center text-xs font-heading text-[#D8A065] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-[#D8A065]" />
            <span>
              {isArabic
                ? 'تم فتح الوصول الحصري إلى خزينة الإصدار الثاني! سيتم إخطارك فور بدء مرحلة الحجز المسبق.'
                : 'VIP CLEARANCE GRANTED: You will receive 48-hour priority access prior to public release.'}
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ArchivalVaultTeaser;
