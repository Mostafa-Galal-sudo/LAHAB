import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Package, ShieldCheck, ExternalLink, Copy, CheckCircle2, Clock } from 'lucide-react';
import { Language } from '../translations';
import Wordmark from './Wordmark';
import { GlossyCard } from './GlossyCard';
import ConfirmDialog from './ConfirmDialog';

export interface SavedOrderRecord {
  id: string;
  timestamp: string;
  items: Array<{
    name: string;
    code: string;
    size: string;
    quantity: number;
    price: number;
    monogram?: string;
  }>;
  totalEGP: number;
  paymentMethod: string;
  location: string;
  address: string;
  whatsappUrl?: string;
  gmailUrl?: string;
}

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose, language }) => {
  const isArabic = language === 'ar';
  const [orders, setOrders] = useState<SavedOrderRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('lahab_order_history');
        if (stored) {
          setOrders(JSON.parse(stored));
        }
      } catch {
        setOrders([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearHistory = () => {
    setConfirmingClear(true);
  };

  const confirmClearHistory = () => {
    localStorage.removeItem('lahab_order_history');
    setOrders([]);
    setConfirmingClear(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#070D14]/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-[#0D1929] border border-[#D8A065]/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E2E6E8]/20 bg-[#132238] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Wordmark size="sm" showMedallion={false} />
            <div className="h-4 w-[1px] bg-[#E2E6E8]/30" />
            <div>
              <span className="font-heading text-[10px] text-[#D8A065] tracking-[0.25em] uppercase block">
                {isArabic ? 'سجل الطلبات والمحفوظات' : 'CLIENT ARCHIVE // MY ORDERS'}
              </span>
              <h2 className="font-heading text-xl sm:text-2xl text-[#E2E6E8] tracking-wide mt-0.5">
                {isArabic ? 'طلباتك المؤكدة ومتابعة التتبع' : 'Your Orders & Tracking History'}
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

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full border border-[#D8A065]/40 bg-[#132238] flex items-center justify-center mx-auto text-[#D8A065]">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-lg text-[#E2E6E8] uppercase tracking-wide">
                {isArabic ? 'لا توجد طلبات سابقة حتى الآن' : 'NO SAVED ORDERS YET'}
              </h3>
              <p className="text-xs text-[#E2E6E8]/60 font-body">
                {isArabic
                  ? 'عند إتمام أي حجز جديد سيتم توثيق كود التتبع والقطع هنا تلقائياً لسهولة المتابعة.'
                  : 'When you place an order, your tracking reference and piece details will be recorded here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-[#E2E6E8]/10 pb-3">
                <span className="font-heading text-xs text-[#D8A065] tracking-widest uppercase">
                  {isArabic ? `عدد الطلبات المسجلة: ${orders.length}` : `TOTAL RECORDED ORDERS: ${orders.length}`}
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] font-mono text-red-400/80 hover:text-red-400 cursor-pointer underline"
                >
                  {isArabic ? 'مسح السجل' : 'Clear History'}
                </button>
              </div>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <GlossyCard key={ord.id} className="p-6 space-y-4" glowColor="rgba(216,160,101,0.2)">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E6E8]/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs text-[#D8A065] uppercase">REF CODE:</span>
                          <span className="font-mono text-base font-bold text-[#E2E6E8] tracking-wider">{ord.id}</span>
                          <button
                            onClick={() => handleCopyCode(ord.id)}
                            className="p-1 border border-[#D8A065]/40 text-[#D8A065] hover:bg-[#D8A065]/20 cursor-pointer"
                            title="Copy Ref Code"
                          >
                            {copiedId === ord.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#E2E6E8]/60 font-mono mt-1">
                          <Clock className="w-3 h-3 text-[#D8A065]" />
                          <span>{new Date(ord.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span>{ord.location}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-lg font-bold text-[#D8A065] block">
                          {ord.totalEGP.toLocaleString()} EGP
                        </span>
                        <span className="text-[10px] font-heading uppercase text-[#E2E6E8]/70 border border-[#D8A065]/30 px-2 py-0.5 inline-block mt-1">
                          {ord.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="space-y-2">
                      <span className="font-heading text-[11px] text-[#D8A065] uppercase tracking-wider block">
                        {isArabic ? 'القطع بالحجز:' : 'ORDERED PIECES:'}
                      </span>
                      <div className="space-y-1.5 bg-[#0D1929] p-3 border border-[#E2E6E8]/10">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-body py-1 border-b border-[#1e3a5f]/50 last:border-none">
                            <div>
                              <span className="font-heading text-[#E2E6E8]">{item.name}</span>
                              <span className="text-[#D8A065] font-mono text-[11px] ml-2">[{item.code}]</span>
                              <div className="text-[11px] text-[#E2E6E8]/60 font-mono">
                                Size: {item.size} | Qty: {item.quantity} {item.monogram && `| Monogram: ${item.monogram}`}
                              </div>
                            </div>
                            <span className="font-mono text-[#E2E6E8]">{item.price * item.quantity} EGP</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Re-open links */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isArabic ? 'حالة الطلب: مؤكد بالأرشيف' : 'Status: Secured & Allocated'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.whatsappUrl && (
                          <a
                            href={ord.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-lahab-primary px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 no-underline"
                          >
                            <span>💬</span>
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {ord.gmailUrl && (
                          <a
                            href={ord.gmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-lahab-outline px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 no-underline hover:bg-[#D8A065] hover:text-[#0D1929]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Gmail</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </GlossyCard>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={confirmingClear}
        title={isArabic ? 'مسح سجل الطلبات؟' : 'Clear order history?'}
        message={
          isArabic
            ? 'هيتشال سجل الطلبات المحفوظ على متصفحك بس (مش من عندنا). متقدرش تتراجع بعد كده.'
            : "This clears the order history saved on this browser only (not our records). This can't be undone."
        }
        confirmLabel={isArabic ? 'مسح' : 'Clear'}
        cancelLabel={isArabic ? 'إلغاء' : 'Cancel'}
        danger
        onConfirm={confirmClearHistory}
        onCancel={() => setConfirmingClear(false)}
      />
    </div>
  );
};

export default MyOrdersModal;
