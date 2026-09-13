import React from 'react';
import { motion } from 'motion/react';
import { Download, Share2, CheckCircle2, ShieldCheck, Printer, Sparkles, Award } from 'lucide-react';
import Wordmark from './Wordmark';

export interface COARecord {
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

interface COAModalProps {
  record: COARecord;
  isArabic: boolean;
  onClose: () => void;
}

export const AuthenticityCertificateModal: React.FC<COAModalProps> = ({ record, isArabic, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-99999 bg-[#070D14]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-2xl w-full bg-[#0D1929] border-2 border-[#D8A065] p-6 sm:p-12 shadow-[0_0_60px_rgba(216,160,101,0.25)] space-y-8 my-8 print:border-none print:shadow-none print:bg-white print:text-black print:p-0"
      >
        {/* Decorative Gold Guilloche Corner Borders */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D8A065]" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D8A065]" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D8A065]" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D8A065]" />

        {/* Certificate Header */}
        <div className="text-center space-y-4 border-b border-[#D8A065]/30 pb-6">
          <div className="flex justify-center mb-2">
            <Wordmark size="md" showMedallion={true} />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D8A065]/10 border border-[#D8A065]/40 text-[#D8A065] font-heading text-xs tracking-widest uppercase">
            <Award className="w-4 h-4" />
            <span>{isArabic ? 'وثيقة أصالة رسمية غير قابلة للتزوير' : 'OFFICIAL ARCHIVAL PASSPORT OF AUTHENTICITY'}</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl text-[#E2E6E8] uppercase tracking-wider">
            {isArabic ? record.pieceNameAr : record.pieceNameEn}
          </h1>

          <p className="font-body text-xs text-[#E2E6E8]/70 max-w-md mx-auto">
            {isArabic
              ? 'تعتبر هذه الوثيقة إثباتاً رسمياً ومسجلاً لمصدر ونقاوة الألياف والنسيج اليدوي لهذه القطعة من لَهَب.'
              : 'This document serves as an immutable certificate of provenance, verifying cotton purity, milling location, and artisan craftsmanship.'}
          </p>
        </div>

        {/* Core Certificate Grid */}
        <div className="grid grid-cols-2 gap-6 font-body text-xs sm:text-sm">
          <div className="p-3 border border-[#E2E6E8]/10 bg-[#132238]/40 space-y-1">
            <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
              {isArabic ? 'الرقم التسلسلي الأرشيفي' : 'Serial Identifier'}
            </span>
            <span className="font-mono font-bold text-base text-[#E2E6E8] block">
              {record.serial}
            </span>
          </div>

          <div className="p-3 border border-[#E2E6E8]/10 bg-[#132238]/40 space-y-1">
            <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
              {isArabic ? 'رقم الإصدار المحدود' : 'Edition Number'}
            </span>
            <span className="font-mono font-bold text-base text-[#D8A065] block">
              #{String(record.pieceNumber).padStart(3, '0')} / {record.totalRun}
            </span>
          </div>

          <div className="p-3 border border-[#E2E6E8]/10 bg-[#132238]/40 space-y-1">
            <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
              {isArabic ? 'رتبة وتصنيف القطن' : 'Cotton Grade & Staple'}
            </span>
            <span className="text-[#E2E6E8] font-semibold block">
              {isArabic ? record.cottonGradeAr : record.cottonGradeEn}
            </span>
          </div>

          <div className="p-3 border border-[#E2E6E8]/10 bg-[#132238]/40 space-y-1">
            <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
              {isArabic ? 'كثافة النسيج والوزن' : 'Grammage & Fabric'}
            </span>
            <span className="font-mono text-[#D8A065] font-bold block">
              {record.weight}
            </span>
          </div>

          <div className="p-3 border border-[#E2E6E8]/10 bg-[#132238]/40 space-y-1 col-span-2 sm:col-span-1">
            <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
              {isArabic ? 'المغزل والمشغل الأرشيفي' : 'Weaving Atelier'}
            </span>
            <span className="text-[#E2E6E8]/90 block">
              {isArabic ? record.millAr : record.millEn}
            </span>
          </div>

          <div className="p-3 border border-[#E2E6E8]/10 bg-[#132238]/40 space-y-1 col-span-2 sm:col-span-1">
            <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
              {isArabic ? 'كبير الحرفيين المشرف' : 'Master Artisan'}
            </span>
            <span className="text-[#E2E6E8]/90 block">
              {isArabic ? record.artisanAr : record.artisanEn}
            </span>
          </div>
        </div>

        {/* Cryptographic Seal & Signature Section */}
        <div className="border-t border-[#D8A065]/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#D8A065] bg-[#132238] flex items-center justify-center text-[#D8A065] shadow-[0_0_15px_rgba(216,160,101,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#D8A065] block uppercase">NFC CRYPTOGRAPHIC HASH</span>
              <span className="font-mono text-xs text-[#E2E6E8]/70">{record.nfcHash}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-heading text-[10px] text-[#E2E6E8]/50 uppercase block">AUTHENTICATED BY</span>
            <span className="font-heading text-sm text-[#D8A065] tracking-widest block">LΛHΛB ARCHIVE REGISTRY</span>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E6E8]/15 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-lahab-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isArabic ? 'طباعة / حفظ PDF' : 'PRINT / SAVE PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-lahab-outline px-5 py-2.5 text-xs cursor-pointer"
          >
            {isArabic ? 'إغلاق' : 'CLOSE'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthenticityCertificateModal;
