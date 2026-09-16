import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Search, Award, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { Language } from '../translations';
import Wordmark from './Wordmark';
import AuthenticityCertificateModal from './AuthenticityCertificateModal';

interface SerialVerifierProps {
  language: Language;
}

interface VerificationRecord {
  serial: string;
  pieceNameEn: string;
  pieceNameAr: string;
  pieceNumber: number;
  totalRun: number;
  cottonGradeEn: string;
  cottonGradeAr: string;
  millEn: string;
  millAr: string;
  artisanEn: string;
  artisanAr: string;
  weight: string;
  inspectionDate: string;
  nfcHash: string;
}

const SAMPLE_DATABASE: Record<string, VerificationRecord> = {
  'LHB-01-018/200': {
    serial: 'LHB-01-018/200',
    pieceNameEn: 'Drop 01 Heavyweight Hoodie',
    pieceNameAr: 'هودي الإصدار الأول فائق الثقل',
    pieceNumber: 18,
    totalRun: 200,
    cottonGradeEn: '100% Giza 86 Extra-Long Staple (ELS)',
    cottonGradeAr: 'قطن مصري أصيل جيزة 86 طويل التيلة 100%',
    millEn: 'El-Mahalla El-Kubra Traditional Weaving Mills, Nile Delta',
    millAr: 'مصانع المحلة الكبرى التاريخية، دلتا النيل',
    artisanEn: 'Master Artisan Tarek H. (Studio Cairo)',
    artisanAr: 'المعلم طارق ح. (مشغل القاهرة الأرشيفي)',
    weight: '520 GSM Loopback Fleece',
    inspectionDate: 'November 2024',
    nfcHash: '0x7F9E...C412-GENUINE',
  },
  'LHB-01-042/200': {
    serial: 'LHB-01-042/200',
    pieceNameEn: 'Drop 01 Heavyweight Hoodie',
    pieceNameAr: 'هودي الإصدار الأول فائق الثقل',
    pieceNumber: 42,
    totalRun: 200,
    cottonGradeEn: '100% Giza 86 Extra-Long Staple (ELS)',
    cottonGradeAr: 'قطن مصري أصيل جيزة 86 طويل التيلة 100%',
    millEn: 'El-Mahalla El-Kubra Traditional Weaving Mills, Nile Delta',
    millAr: 'مصانع المحلة الكبرى التاريخية، دلتا النيل',
    artisanEn: 'Master Artisan Sayed M. (Studio Cairo)',
    artisanAr: 'المعلم سيد م. (مشغل القاهرة الأرشيفي)',
    weight: '520 GSM Loopback Fleece',
    inspectionDate: 'December 2024',
    nfcHash: '0x3B8A...E891-GENUINE',
  },
  'LHB-01-084/200': {
    serial: 'LHB-01-084/200',
    pieceNameEn: 'Drop 01 Heavyweight Hoodie',
    pieceNameAr: 'هودي الإصدار الأول فائق الثقل',
    pieceNumber: 84,
    totalRun: 200,
    cottonGradeEn: '100% Giza 86 Extra-Long Staple (ELS)',
    cottonGradeAr: 'قطن مصري أصيل جيزة 86 طويل التيلة 100%',
    millEn: 'El-Mahalla El-Kubra Traditional Weaving Mills, Nile Delta',
    millAr: 'مصانع المحلة الكبرى التاريخية، دلتا النيل',
    artisanEn: 'Atelier Lead Yasmin R. (Studio Cairo)',
    artisanAr: 'رئيسة المشغل ياسمين ر. (مشغل القاهرة الأرشيفي)',
    weight: '520 GSM Loopback Fleece',
    inspectionDate: 'December 2024',
    nfcHash: '0x99CF...A104-GENUINE',
  },
};

export const SerialVerifier: React.FC<SerialVerifierProps> = ({ language }) => {
  const isArabic = language === 'ar';
  const [inputSerial, setInputSerial] = useState('LHB-01-042/200');
  const [result, setResult] = useState<VerificationRecord | null>(SAMPLE_DATABASE['LHB-01-042/200']);
  const [hasSearched, setHasSearched] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [foilPos, setFoilPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate max 12 deg
    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    const foilX = (x / rect.width) * 100;
    const foilY = (y / rect.height) * 100;

    setCardRotate({ x: rotateX, y: rotateY });
    setFoilPos({ x: foilX, y: foilY, opacity: 1 });
  };

  const handleCardMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
    setFoilPos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputSerial.replace(/[^A-Za-z0-9\/-]/g, '').trim().toUpperCase().slice(0, 20);
    setHasSearched(true);
    // SECURITY FIX: Only serials that exist in the real registered database verify.
    // Previously, ANY serial matching the LHB-01-xxx/200 pattern (1-200) was auto-accepted
    // and issued a fake "GENUINE" certificate with a randomly generated hash - meaning
    // anyone, including counterfeiters, could forge a valid-looking certificate for any
    // number. Until a real backend-verified serial registry exists, unregistered serials
    // must correctly show as unverified rather than being rubber-stamped as genuine.
    setResult(SAMPLE_DATABASE[clean] || null);
  };

  const handleCopyCertificate = () => {
    if (!result) return;
    navigator.clipboard.writeText(`LAHAB Drop 01 Certificate of Authenticity // Serial: ${result.serial} // Hash: ${result.nfcHash}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="authenticity"
      className="bg-[#09111C] text-[#E2E6E8] px-4 sm:px-8 lg:px-16 py-28 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto relative z-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 border border-[#D8A065]/40 px-3 py-1 bg-[#132238]/60 text-xs font-heading text-[#D8A065] tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isArabic ? 'التحقق الأرشيفي الرقمي' : 'ARCHIVAL SERIAL VERIFIER'}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl text-[#D8A065] uppercase tracking-wide">
            {isArabic ? 'التحقق من أصالة القطعة وسجل الإنتاج' : 'Certificate of Authenticity'}
          </h2>

          <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/70 max-w-xl mx-auto leading-relaxed">
            {isArabic
              ? 'تحمل كل قطعة من لَهَب رمزاً تسلسلياً فريداً منقوشاً على بطاقة العنق، يثبت أصالتها ومصدر غزلها وتطريزها اليدوي في مصر.'
              : 'Every LΛHΛB piece is individually numbered (1 of 200) with a woven tamper-proof security identifier. Verify its provenance and weaving batch here.'}
          </p>
        </div>

        {/* Verification Input Box */}
        <div className="bg-[#0D1929] border border-[#D8A065]/40 p-6 sm:p-8 shadow-2xl space-y-4">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputSerial}
                onChange={(e) => setInputSerial(e.target.value)}
                placeholder="e.g. LHB-01-042/200"
                className="w-full bg-[#132238]/80 border border-[#E2E6E8]/30 px-4 py-3.5 text-sm sm:text-base font-mono font-bold text-[#E2E6E8] placeholder-[#E2E6E8]/40 focus:outline-none focus:border-[#D8A065] uppercase transition-colors"
              />
              <Search className="w-4 h-4 text-[#D8A065] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="btn-lahab-primary px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isArabic ? 'فحص الأصالة' : 'VERIFY PIECE'}</span>
            </button>
          </form>

          {/* Quick-test Sample Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-heading text-[11px] text-[#E2E6E8]/60 uppercase">
              {isArabic ? 'نماذج سريعة للاختبار:' : 'Test Archive Serials:'}
            </span>
            {['LHB-01-018/200', 'LHB-01-042/200', 'LHB-01-084/200'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setInputSerial(s);
                  setResult(SAMPLE_DATABASE[s]);
                  setHasSearched(true);
                }}
                className={`px-2.5 py-1 font-mono text-[11px] border transition-all cursor-pointer ${
                  inputSerial === s
                    ? 'border-[#D8A065] bg-[#D8A065]/20 text-[#D8A065]'
                    : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/70 hover:border-[#D8A065]/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result / Digital COA Card with 3D Holographic Foil Effect */}
        <AnimatePresence mode="wait">
          {hasSearched && result && (
            <div className="perspective-[1000px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={{
                  transform: `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.1s ease-out',
                }}
                className="border-2 border-[#D8A065] bg-[#0D1929] p-6 sm:p-10 shadow-2xl relative overflow-hidden group rounded-sm"
              >
                {/* 3D Dynamic Holographic Gold Rainbow Foil Sheen */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-20"
                  style={{
                    opacity: foilPos.opacity,
                    background: `radial-gradient(circle at ${foilPos.x}% ${foilPos.y}%, rgba(216, 160, 101, 0.35) 0%, rgba(255, 215, 0, 0.2) 30%, rgba(255, 255, 255, 0.1) 50%, transparent 80%)`,
                    mixBlendMode: 'screen',
                  }}
                />

                {/* Gold Guilloche Border Accent */}
                <div className="absolute inset-1.5 border border-[#D8A065]/30 pointer-events-none" />

              {/* Verified Badge Stamp */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#D8A065]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#D8A065] flex items-center justify-center bg-[#132238] text-[#D8A065] shadow-[0_0_15px_rgba(216,160,101,0.3)]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                        {isArabic ? 'شهادة أصالة معتمدة' : 'OFFICIAL CERTIFICATE OF AUTHENTICITY'}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D8A065]" />
                    </div>
                    <h3 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] uppercase tracking-wide mt-0.5">
                      {isArabic ? result.pieceNameAr : result.pieceNameEn}
                    </h3>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs text-[#E2E6E8]/60 block uppercase">EDITION RUN</span>
                  <span className="text-xl font-bold text-[#D8A065]">
                    #{String(result.pieceNumber).padStart(3, '0')} / {result.totalRun}
                  </span>
                </div>
              </div>

              {/* Provenance Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm font-body">
                <div className="space-y-1">
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? 'الكود التسلسلي المشفر:' : 'Archive Serial Identifier:'}
                  </span>
                  <span className="font-mono font-bold text-base text-[#E2E6E8]">
                    {result.serial}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? 'نقاوة ورتبة القطن:' : 'Cotton Cultivar & Purity:'}
                  </span>
                  <span className="text-[#E2E6E8] font-bold">
                    {isArabic ? result.cottonGradeAr : result.cottonGradeEn}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? 'موقع الغزل والنسيج:' : 'Weaving & Milling Atelier:'}
                  </span>
                  <span className="text-[#E2E6E8]">
                    {isArabic ? result.millAr : result.millEn}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? 'كبير الحرفيين المشرف:' : 'Master Embroidery Artisan:'}
                  </span>
                  <span className="text-[#E2E6E8]">
                    {isArabic ? result.artisanAr : result.artisanEn}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? 'كثافة النسيج والوزن:' : 'Textile Grammage:'}
                  </span>
                  <span className="font-mono font-bold text-[#D8A065]">
                    {result.weight}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase tracking-wider block">
                    {isArabic ? 'تاريخ الفحص والاعتماد:' : 'Production Batch & Date:'}
                  </span>
                  <span className="text-[#E2E6E8]/80 font-mono">
                    {result.inspectionDate}
                  </span>
                </div>
              </div>

              {/* Cryptographic NFC Watermark Footer */}
              <div className="mt-8 pt-6 border-t border-[#E2E6E8]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Wordmark size="sm" showMedallion={false} />
                  <span className="font-mono text-[11px] text-[#E2E6E8]/60">
                    HASH: {result.nfcHash}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassportModal(true)}
                    className="btn-lahab-primary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'عرض الجواز الرقمي' : 'VIEW PASSPORT'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCertificate}
                    className="btn-lahab-outline px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#D8A065]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isArabic ? 'تم النسخ!' : 'COPIED') : (isArabic ? 'نسخ' : 'COPY')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          )}

          {/* Full-Screen Archival Passport Certificate Modal */}
          {showPassportModal && result && (
            <AuthenticityCertificateModal
              record={result}
              isArabic={isArabic}
              onClose={() => setShowPassportModal(false)}
            />
          )}

          {hasSearched && !result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-red-500/50 bg-[#132238]/60 p-6 text-center space-y-3"
            >
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="font-heading text-lg text-red-400 uppercase">
                {isArabic ? 'الرمز غير مسجل في الأرشيف' : 'UNVERIFIED SERIAL CODE'}
              </h4>
              <p className="text-xs text-[#E2E6E8]/70 font-body max-w-md mx-auto">
                {isArabic
                  ? 'لم يتم العثور على هذا الرمز التسلسلي في قاعدة بيانات الإصدار الأول DROP 01. يرجى التأكد من الرمز المدخل على ملصق العنق الداخلي.'
                  : 'This serial code was not found in the official Drop 01 register. Please verify the woven code on your garment neck label or try one of the sample codes above.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SerialVerifier;
