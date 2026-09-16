import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Truck, Check, DollarSign } from 'lucide-react';
import { Language } from '../translations';

interface CurrencyShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
}

interface RegionOption {
  code: string;
  nameEn: string;
  nameAr: string;
  currency: string;
  flag: string;
  rateToEGP: number; // Conversion multiplier
  freeShippingMin: number;
}

export const REGIONS: RegionOption[] = [
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', currency: 'EGP', flag: '🇪🇬', rateToEGP: 1, freeShippingMin: 2000 },
  { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', currency: 'AED', flag: '🇦🇪', rateToEGP: 0.075, freeShippingMin: 350 },
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', currency: 'SAR', flag: '🇸🇦', rateToEGP: 0.076, freeShippingMin: 360 },
  { code: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', currency: 'GBP', flag: '🇬🇧', rateToEGP: 0.016, freeShippingMin: 85 },
  { code: 'US', nameEn: 'United States & Global', nameAr: 'الولايات المتحدة والعالم', currency: 'USD', flag: '🌐', rateToEGP: 0.020, freeShippingMin: 100 },
];

export const CurrencyShippingModal: React.FC<CurrencyShippingModalProps> = ({
  isOpen,
  onClose,
  language,
  selectedCurrency,
  onSelectCurrency,
}) => {
  const isArabic = language === 'ar';
  const currentRegion = REGIONS.find((r) => r.currency === selectedCurrency) || REGIONS[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070D14]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0D1929] border-2 border-[#D8A065] text-[#E2E6E8] p-6 sm:p-8 shadow-2xl overflow-hidden z-10 my-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D8A065]/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#D8A065] flex items-center justify-center bg-[#132238] text-[#D8A065]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                  {isArabic ? 'العملة والتوصيل الإقليمي' : 'GLOBAL REGION & CURRENCY'}
                </span>
                <h3 className="font-heading text-xl text-[#E2E6E8] uppercase tracking-wide">
                  {isArabic ? 'اختر وجهة التوصيل والعملة' : 'Select Destination & Currency'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#E2E6E8]/20 hover:border-[#D8A065] text-[#E2E6E8] hover:text-[#D8A065] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Region List */}
          <div className="space-y-3">
            {REGIONS.map((region) => {
              const isSelected = selectedCurrency === region.currency;
              return (
                <button
                  key={region.code}
                  onClick={() => {
                    onSelectCurrency(region.currency);
                    onClose();
                  }}
                  className={`w-full p-4 border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#D8A065] bg-[#D8A065]/20 text-[#D8A065] font-bold shadow-md'
                      : 'border-[#E2E6E8]/20 bg-[#132238]/40 text-[#E2E6E8]/80 hover:border-[#D8A065]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                      <span className="font-body text-sm block">
                        {isArabic ? region.nameAr : region.nameEn}
                      </span>
                      <span className="text-[11px] font-mono text-[#E2E6E8]/60 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-[#D8A065]" />
                        {isArabic
                          ? `توصيل مجاني للطلبات أصل من ${region.freeShippingMin} ${region.currency}`
                          : `Free Courier Shipping over ${region.freeShippingMin} ${region.currency}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#D8A065]">
                      {region.currency}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#D8A065]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Free Shipping Assurance Footer */}
          <div className="p-4 border border-[#D8A065]/30 bg-[#132238]/60 text-xs font-body text-[#E2E6E8]/80 flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#D8A065] shrink-0" />
            <span>
              {isArabic
                ? `جميع الطلبات تشمل المعاينة والتجربة عند الباب قبل السداد ورسائل التتبع المباشر.`
                : `All shipments include door-step courier fit inspection prior to payment and live SMS tracking.`}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CurrencyShippingModal;
