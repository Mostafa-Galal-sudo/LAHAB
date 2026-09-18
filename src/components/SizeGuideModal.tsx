import React from 'react';
import { TranslationSchema, Language } from '../translations';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSchema['sizeModal'];
  language: Language;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  if (!isOpen) return null;

  const sizeData = [
    { size: 'S', chest: '60 cm', length: '71 cm', shoulder: '58 cm', height: '165 - 175 cm' },
    { size: 'M', chest: '63 cm', length: '73 cm', shoulder: '60 cm', height: '172 - 180 cm' },
    { size: 'L', chest: '66 cm', length: '75 cm', shoulder: '62 cm', height: '178 - 186 cm' },
    { size: 'XL', chest: '69 cm', length: '77 cm', shoulder: '64 cm', height: '184 - 192 cm' },
    { size: 'XXL', chest: '72 cm', length: '79 cm', shoulder: '66 cm', height: '190+ cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#070E18]/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        id="size-guide-modal"
        className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0D1929] border border-[#E2E6E8]/20 p-4 sm:p-8 text-[#E2E6E8] shadow-2xl space-y-5 sm:space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#E2E6E8]/20 pb-4">
          <div>
            <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase block">
              {t.title}
            </span>
            <h3 className="font-heading text-2xl text-[#E2E6E8] uppercase mt-1">
              ARCHITECTURAL BOXY CUT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-[#E2E6E8]/30 flex items-center justify-center text-sm hover:border-[#D8A065] hover:text-[#D8A065] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/85">
          {t.subtitle}
        </p>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E2E6E8]/20">
          <div className="bg-[#132238] px-4 py-2 text-[11px] font-mono text-[#D8A065] border-b border-[#E2E6E8]/10">
            {t.unitLabel}
          </div>
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="bg-[#0D1929] border-b border-[#E2E6E8]/20 text-[#D8A065] font-heading">
                <th className="p-3">{t.thSize}</th>
                <th className="p-3">{t.thChest}</th>
                <th className="p-3">{t.thLength}</th>
                <th className="p-3">{t.thShoulder}</th>
                <th className="p-3">{t.thHeight}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6E8]/10 font-mono">
              {sizeData.map((row) => (
                <tr key={row.size} className="hover:bg-[#132238]/40 transition-colors">
                  <td className="p-3 font-heading text-sm text-[#D8A065] font-bold">
                    {row.size}
                  </td>
                  <td className="p-3 text-[#E2E6E8]">{row.chest}</td>
                  <td className="p-3 text-[#E2E6E8]">{row.length}</td>
                  <td className="p-3 text-[#E2E6E8]">{row.shoulder}</td>
                  <td className="p-3 text-[#E2E6E8]/80">{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="p-4 bg-[#132238]/60 border border-[#E2E6E8]/10 text-xs font-body space-y-1 text-[#E2E6E8]/85">
          <span className="text-[#D8A065] font-bold block uppercase">{t.guideTitle}</span>
          <p>• {t.guide1}</p>
          <p>• {t.guide2}</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="btn-lahab-primary px-6 py-2.5 text-xs font-bold cursor-pointer"
          >
            {t.understoodBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
export default SizeGuideModal;
