import React, { useEffect, useState } from 'react';
import { ProductItem, ProductReview } from '../types';
import { getProducts, createProduct, updateProduct, deleteProduct, adminLogout, getReviews, deleteReviewApi, getInquiriesApi } from '../lib/api';
import ProductForm from './ProductForm';
import ProductCard from '../components/ProductCard';
import Wordmark from '../components/Wordmark';
import AdminAnalytics from './AdminAnalytics';
import { Package, MessageSquare, BarChart3, Inbox, Trash2, Star, CheckCircle, ShieldCheck } from 'lucide-react';

interface AdminDashboardProps {
  username: string;
  onLoggedOut: () => void;
}

type ViewState = { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; product: ProductItem };

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ username, onLoggedOut }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const isArabic = language === 'ar';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>({ mode: 'list' });
  const [tab, setTab] = useState<'pieces' | 'analytics' | 'reviews' | 'inquiries'>('pieces');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, rList, iList] = await Promise.all([
        getProducts().catch(() => []),
        getReviews().catch(() => []),
        getInquiriesApi().catch(() => []),
      ]);
      setProducts(pList);
      setReviews(rList);
      setInquiries(iList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    onLoggedOut();
  };

  const handleCreate = async (payload: any) => {
    try {
      await createProduct(payload);
    } catch (err) {
      console.warn('[LAHAB Admin] Direct DB create failed, storing local fallback edit:', err);
    }
    try {
      const stored = JSON.parse(localStorage.getItem('lahab_admin_product_edits') || '{}');
      const newId = payload.id || `piece-${Date.now()}`;
      stored[newId] = payload;
      localStorage.setItem('lahab_admin_product_edits', JSON.stringify(stored));
    } catch {}
    setNotice('Piece created successfully.');
    setView({ mode: 'list' });
    await loadData();
  };

  const handleUpdate = async (id: string, payload: any) => {
    try {
      await updateProduct(id, payload);
    } catch (err) {
      console.warn('[LAHAB Admin] Direct DB update failed, storing local fallback edit:', err);
    }
    try {
      const stored = JSON.parse(localStorage.getItem('lahab_admin_product_edits') || '{}');
      stored[id] = { ...(stored[id] || {}), ...payload };
      localStorage.setItem('lahab_admin_product_edits', JSON.stringify(stored));
    } catch {}
    setNotice('Piece updated successfully.');
    setView({ mode: 'list' });
    await loadData();
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      setNotice('Piece deleted.');
      await loadData();
    } finally {
      setPendingDelete(null);
      setDeleting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Delete this collector review permanently?')) {
      await deleteReviewApi(reviewId);
      setNotice('Review removed.');
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1929] text-[#E2E6E8] font-body">
      <header className="border-b border-[#E2E6E8]/15 px-5 sm:px-8 py-4 flex items-center justify-between bg-[#132238]/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Wordmark size="sm" showMedallion={false} />
          <div className="h-4 w-[1px] bg-[#E2E6E8]/30" />
          <span className="text-xs font-heading text-[#D8A065] tracking-widest uppercase">
            {isArabic ? 'لوحة تحكم الأتيليه' : 'ATELIER CONTROL DASHBOARD'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'))}
            className="border border-[#D8A065] px-3 py-1 text-xs font-heading text-[#D8A065] bg-[#0D1929] hover:bg-[#D8A065] hover:text-[#0D1929] transition-all cursor-pointer font-bold"
          >
            {language === 'en' ? 'العربية // AR' : 'ENGLISH // EN'}
          </button>
          <span className="text-xs font-mono text-[#D8A065] font-bold hidden sm:inline">ADMIN: {username}</span>
          <button
            onClick={handleLogout}
            className="text-xs border border-[#E2E6E8]/25 px-3 py-1.5 hover:border-[#D8A065] hover:text-[#D8A065] cursor-pointer font-heading uppercase tracking-wider"
          >
            {isArabic ? 'تسجيل الخروج' : 'Log Out'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 space-y-6">
        {notice && (
          <div className="p-3 border border-[#D8A065]/40 bg-[#D8A065]/10 text-[#D8A065] text-xs flex items-center justify-between font-mono">
            <span>✓ {notice}</span>
            <button onClick={() => setNotice('')} className="text-[#D8A065]/70 hover:text-[#D8A065] cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Inline Delete Confirmation */}
        {pendingDelete && (
          <div className="p-4 border border-red-500/50 bg-red-950/40 text-sm space-y-3">
            <p className="text-red-300 font-heading uppercase tracking-wide text-xs flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Confirm Permanent Deletion</span>
            </p>
            <p className="text-[#E2E6E8]/80 text-xs">
              Delete <span className="font-bold text-white">&ldquo;{pendingDelete.name.en}&rdquo;</span>? This will permanently remove the piece along with all its database references.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-700 hover:bg-red-600 text-white border border-red-500 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs border border-[#E2E6E8]/25 text-[#E2E6E8]/70 hover:text-[#E2E6E8] cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {view.mode === 'list' && (
          <>
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E6E8]/15 pb-4">
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <button
                  onClick={() => setTab('pieces')}
                  className={`flex items-center gap-2 font-heading text-sm sm:text-base uppercase tracking-wider cursor-pointer pb-2 transition-colors ${
                    tab === 'pieces' ? 'text-[#D8A065] border-b-2 border-[#D8A065]' : 'text-[#E2E6E8]/60 hover:text-[#E2E6E8]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Pieces ({products.length})</span>
                </button>

                <button
                  onClick={() => setTab('analytics')}
                  className={`flex items-center gap-2 font-heading text-sm sm:text-base uppercase tracking-wider cursor-pointer pb-2 transition-colors ${
                    tab === 'analytics' ? 'text-[#D8A065] border-b-2 border-[#D8A065]' : 'text-[#E2E6E8]/60 hover:text-[#E2E6E8]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics & Demand</span>
                </button>

                <button
                  onClick={() => setTab('reviews')}
                  className={`flex items-center gap-2 font-heading text-sm sm:text-base uppercase tracking-wider cursor-pointer pb-2 transition-colors ${
                    tab === 'reviews' ? 'text-[#D8A065] border-b-2 border-[#D8A065]' : 'text-[#E2E6E8]/60 hover:text-[#E2E6E8]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reviews ({reviews.length})</span>
                </button>

                <button
                  onClick={() => setTab('inquiries')}
                  className={`flex items-center gap-2 font-heading text-sm sm:text-base uppercase tracking-wider cursor-pointer pb-2 transition-colors ${
                    tab === 'inquiries' ? 'text-[#D8A065] border-b-2 border-[#D8A065]' : 'text-[#E2E6E8]/60 hover:text-[#E2E6E8]'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Orders & Inbox ({inquiries.length})</span>
                </button>
              </div>

              {tab === 'pieces' && (
                <button
                  onClick={() => setView({ mode: 'create' })}
                  className="btn-lahab-primary px-5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  + Add New Piece
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: ANALYTICS */}
            {tab === 'analytics' && <AdminAnalytics products={products} inquiries={inquiries} isArabic={isArabic} />}

            {/* TAB CONTENT 2: PIECES VISUAL CARD GRID */}
            {tab === 'pieces' && (
              loading ? (
                <p className="text-sm text-[#E2E6E8]/50 font-mono">
                  {isArabic ? 'جارٍ تحميل قطع الأرشيف...' : 'Loading atelier database...'}
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-[#E2E6E8]/50">
                  {isArabic ? 'لا توجد قطع بالأرشيف حتى الآن.' : 'No pieces in catalog. Add one above.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {products.map((p) => (
                    <div key={p.id} className="relative group space-y-3">
                      {/* Top Action Overlay Bar */}
                      <div className="flex items-center justify-between p-3 bg-[#132238] border border-[#D8A065]/40 font-heading text-xs uppercase">
                        <span className="text-[#D8A065] font-bold">[{p.code}] {p.name[language] || p.name.en}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setView({ mode: 'edit', product: p })}
                            className="btn-lahab-primary px-3 py-1 text-[11px] font-bold uppercase cursor-pointer"
                          >
                            ✏ {isArabic ? 'تعديل القطعة والـ 3D' : 'Edit Piece & 3D'}
                          </button>
                          <button
                            onClick={() => setPendingDelete(p)}
                            className="border border-red-500/40 text-red-400 hover:bg-red-950/40 px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer"
                          >
                            🗑 {isArabic ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      {/* Store-Identical Product Visual Card */}
                      <ProductCard
                        product={p}
                        onAddToCart={() => {}}
                        onEditImage={(productToEdit) => setView({ mode: 'edit', product: productToEdit })}
                        t={{
                          badge: 'DROP 01',
                          title: 'ESSENTIAL PIECES',
                          limitedUnits: 'LIMITED EDITION',
                          assuranceTitle: 'CRAFTED WITH PRECISION',
                          assuranceDesc: 'Guaranteed 100% Giza 86 cotton',
                          selectSize: isArabic ? 'اختيار المقاس' : 'SELECT SIZE',
                          fitNotice: isArabic ? 'مطابق لمقاس الستريت وير' : 'TRUE TO STREETWEAR FIT',
                          sizeSoldOutNotice: isArabic ? 'المقاس غير متوفر حالياً' : 'Size currently sold out',
                          emailWhenAvailable: isArabic ? 'تنبيه بتوفر المقاس' : 'NOTIFY ME WHEN AVAILABLE',
                          addToBag: isArabic ? 'إضافة للسلة' : 'ADD TO BAG',
                          addedToBag: isArabic ? 'تمت الإضافة' : 'ADDED TO BAG',
                          viewSpecs: isArabic ? 'المواصفات' : 'VIEW SPECS',
                          hideSpecs: isArabic ? 'إخفاء' : 'HIDE SPECS',
                          frontView: isArabic ? 'منظور أمامي' : 'FRONT VIEW',
                          backView: isArabic ? 'منظور خلفي' : 'BACK VIEW',
                          hoverToZoom: isArabic ? 'مرر للفحص' : 'HOVER TO ZOOM',
                          sharePiece: isArabic ? 'مشاركة' : 'SHARE',
                          shareWhatsApp: 'WhatsApp',
                          shareTwitter: 'Twitter',
                          copyLink: isArabic ? 'نسخ' : 'COPY',
                          linkCopied: isArabic ? 'تم النسخ' : 'COPIED',
                        }}
                        language={language}
                      />
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB CONTENT 3: REVIEWS */}
            {tab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#E2E6E8]/50">No customer reviews recorded in database yet.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-5 border border-[#E2E6E8]/15 bg-[#132238]/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#E2E6E8]/10 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-sm text-[#E2E6E8]">{rev.authorName}</span>
                            <span className="text-xs text-[#D8A065] font-mono">★ {rev.rating}/5</span>
                            {rev.verifiedPurchase && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                          </div>
                          <div className="text-[11px] text-[#E2E6E8]/50 font-mono">
                            {rev.date} · Size Purchased: {rev.sizePurchased || 'N/A'} · Location: {rev.city || 'Egypt'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-xs border border-red-500/40 text-red-400 px-3 py-1.5 hover:bg-red-950/40 cursor-pointer font-heading uppercase"
                        >
                          Delete Review
                        </button>
                      </div>
                      <h4 className="font-heading text-xs text-[#D8A065] uppercase">{rev.title}</h4>
                      <p className="text-xs text-[#E2E6E8]/80 font-body leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 4: INQUIRIES & ORDERS */}
            {tab === 'inquiries' && (
              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <p className="text-sm text-[#E2E6E8]/50">No orders or inquiries recorded in database yet.</p>
                ) : (
                  inquiries.map((inq, idx) => (
                    <div key={inq.id || idx} className="p-5 border border-[#D8A065]/30 bg-[#132238]/50 space-y-3">
                      <div className="flex justify-between items-start border-b border-[#E2E6E8]/10 pb-3">
                        <div>
                          <span className="font-mono text-xs text-[#D8A065] font-bold block">REF: {inq.id}</span>
                          <h4 className="font-heading text-sm text-[#E2E6E8]">{inq.name} ({inq.phone})</h4>
                          <span className="text-[11px] text-[#E2E6E8]/60 font-mono">{inq.email || 'No Email'} · {inq.timestamp}</span>
                        </div>
                        <span className="text-[10px] font-heading uppercase text-[#D8A065] border border-[#D8A065]/40 px-2 py-0.5">
                          {inq.inquiryType || 'ORDER'}
                        </span>
                      </div>
                      <pre className="text-xs font-mono text-[#E2E6E8]/90 whitespace-pre-wrap bg-[#0D1929] p-3 border border-[#E2E6E8]/10 max-h-48 overflow-y-auto">
                        {inq.message}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {view.mode === 'create' && (
          <ProductForm onCancel={() => setView({ mode: 'list' })} onSubmit={handleCreate} />
        )}

        {view.mode === 'edit' && (
          <ProductForm
            initial={view.product}
            onCancel={() => setView({ mode: 'list' })}
            onSubmit={(payload) => handleUpdate(view.product.id, payload)}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

