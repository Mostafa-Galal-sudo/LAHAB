import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { ProductItem, GarmentSize } from '../types';
import { uploadAsset } from '../lib/api';

interface ProductFormProps {
  initial?: ProductItem | null;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

const ALL_SIZES: GarmentSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

const emptyForm = {
  code: '',
  nameEn: '',
  nameAr: '',
  priceEGP: '',
  weight: '',
  fitEn: '',
  fitAr: '',
  materialEn: '',
  materialAr: '',
  descriptionEn: '',
  descriptionAr: '',
  frontDetailEn: '',
  frontDetailAr: '',
  backDetailEn: '',
  backDetailAr: '',
  sizes: ['S', 'M', 'L', 'XL', 'XXL'] as GarmentSize[],
  outOfStockSizes: [] as GarmentSize[],
  tagsEn: '',
  tagsAr: '',
  editorialImage: '',
};

export const ProductForm: React.FC<ProductFormProps> = ({ initial, onCancel, onSubmit }) => {
  const [form, setForm] = useState(() => {
    if (!initial) return emptyForm;
    return {
      code: initial.code,
      nameEn: initial.name.en,
      nameAr: initial.name.ar,
      priceEGP: String(initial.priceEGP),
      weight: initial.weight,
      fitEn: initial.fit.en,
      fitAr: initial.fit.ar,
      materialEn: initial.material.en,
      materialAr: initial.material.ar,
      descriptionEn: initial.description.en,
      descriptionAr: initial.description.ar,
      frontDetailEn: initial.frontDetail.en,
      frontDetailAr: initial.frontDetail.ar,
      backDetailEn: initial.backDetail.en,
      backDetailAr: initial.backDetail.ar,
      sizes: initial.sizes,
      outOfStockSizes: initial.outOfStockSizes || [],
      tagsEn: (initial.tags?.en || []).join(', '),
      tagsAr: (initial.tags?.ar || []).join(', '),
      editorialImage: initial.editorialImage || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [error, setError] = useState('');

  const toggleSize = (size: GarmentSize) => {
    setForm((prev) => {
      const has = prev.sizes.includes(size);
      const sizes = has ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      const outOfStockSizes = prev.outOfStockSizes.filter((s) => sizes.includes(s));
      return { ...prev, sizes, outOfStockSizes };
    });
  };

  const toggleOutOfStock = (size: GarmentSize) => {
    setForm((prev) => ({
      ...prev,
      outOfStockSizes: prev.outOfStockSizes.includes(size)
        ? prev.outOfStockSizes.filter((s) => s !== size)
        : [...prev.outOfStockSizes, size],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = Number(form.priceEGP);
    if (!form.code || !form.nameEn || !form.nameAr || !price || price <= 0 || form.sizes.length === 0) {
      setError('Please fill in code, name (EN/AR), a valid price, and at least one size.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        code: form.code,
        name: { en: form.nameEn, ar: form.nameAr },
        priceEGP: price,
        weight: form.weight,
        fit: { en: form.fitEn, ar: form.fitAr },
        material: { en: form.materialEn, ar: form.materialAr },
        description: { en: form.descriptionEn, ar: form.descriptionAr },
        frontDetail: { en: form.frontDetailEn, ar: form.frontDetailAr },
        backDetail: { en: form.backDetailEn, ar: form.backDetailAr },
        sizes: form.sizes,
        outOfStockSizes: form.outOfStockSizes,
        tags: {
          en: form.tagsEn.split(',').map((t) => t.trim()).filter(Boolean),
          ar: form.tagsAr.split(',').map((t) => t.trim()).filter(Boolean),
        },
        editorialImage: form.editorialImage || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string, onChange: (v: string) => void, opts?: { textarea?: boolean; type?: string }) => (
    <div className="space-y-1">
      <label className="text-[11px] font-heading text-[#E2E6E8]/70 uppercase tracking-wider block">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-[#0D1929] border border-[#E2E6E8]/25 px-3 py-2 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065]"
        />
      ) : (
        <input
          type={opts?.type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0D1929] border border-[#E2E6E8]/25 px-3 py-2 text-xs text-[#E2E6E8] focus:outline-none focus:border-[#D8A065]"
        />
      )}
    </div>
  );

  const imgFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setError('');
    setImageUploading(true);
    setImageProgress(0);
    try {
      const asset = await uploadAsset(file, 'image', setImageProgress);
      setForm((prev) => ({ ...prev, editorialImage: asset.publicUrl }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-[#132238]/50 border border-[#D8A065]/30 p-5 sm:p-6">
      <h2 className="font-heading text-sm text-[#D8A065] uppercase tracking-wider">
        {initial ? 'Edit Piece' : 'Add New Piece'}
      </h2>

      {error && <div className="p-3 border border-red-500/60 bg-red-950/40 text-red-300 text-xs">{error}</div>}

      {/* Product Image Selection — 1-Click File Picker */}
      <div className="border border-[#D8A065]/50 bg-[#0D1929] p-4 space-y-3">
        <label className="text-xs font-heading text-[#D8A065] uppercase tracking-wider block">
          Product Image (الصورة الرسمية للقطعة)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {form.editorialImage ? (
            <img src={form.editorialImage} alt="Preview" className="w-20 h-24 object-cover border border-[#D8A065]/40" />
          ) : (
            <div className="w-20 h-24 bg-[#132238] border border-dashed border-[#E2E6E8]/20 flex items-center justify-center text-xs text-[#E2E6E8]/40">
              No Image
            </div>
          )}
          <div className="space-y-2 flex-1 w-full">
            <button
              type="button"
              onClick={() => imgFileInputRef.current?.click()}
              disabled={imageUploading}
              className="btn-lahab-primary w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{imageUploading ? `Uploading ${imageProgress}%` : 'Choose Image from Device (اختر صورة من جهازك)'}</span>
            </button>
            <input
              ref={imgFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif,.gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFileSelect(file);
              }}
            />
            <p className="text-[10px] text-[#E2E6E8]/60 font-body">
              Uploads to the asset library (JPG, PNG, WEBP, AVIF, GIF). Binary data is never stored in D1.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('Code (e.g. DROP 01 // PIECE 02)', form.code, (v) => setForm({ ...form, code: v }))}
        {field('Price (EGP)', form.priceEGP, (v) => setForm({ ...form, priceEGP: v }), { type: 'number' })}
        {field('Name (English)', form.nameEn, (v) => setForm({ ...form, nameEn: v }))}
        {field('Name (Arabic)', form.nameAr, (v) => setForm({ ...form, nameAr: v }))}
        {field('Weight / Grammage (e.g. 520 GSM FLEECE)', form.weight, (v) => setForm({ ...form, weight: v }))}
        {field('Fit (English)', form.fitEn, (v) => setForm({ ...form, fitEn: v }))}
        {field('Fit (Arabic)', form.fitAr, (v) => setForm({ ...form, fitAr: v }))}
        {field('Material (English)', form.materialEn, (v) => setForm({ ...form, materialEn: v }))}
        {field('Material (Arabic)', form.materialAr, (v) => setForm({ ...form, materialAr: v }))}
        {field('Front Detail (English)', form.frontDetailEn, (v) => setForm({ ...form, frontDetailEn: v }))}
        {field('Front Detail (Arabic)', form.frontDetailAr, (v) => setForm({ ...form, frontDetailAr: v }))}
        {field('Back Detail (English)', form.backDetailEn, (v) => setForm({ ...form, backDetailEn: v }))}
        {field('Back Detail (Arabic)', form.backDetailAr, (v) => setForm({ ...form, backDetailAr: v }))}
        {field('Tags (English, comma-separated)', form.tagsEn, (v) => setForm({ ...form, tagsEn: v }))}
        {field('Tags (Arabic, comma-separated)', form.tagsAr, (v) => setForm({ ...form, tagsAr: v }))}
      </div>

      {field('Description (English)', form.descriptionEn, (v) => setForm({ ...form, descriptionEn: v }), { textarea: true })}
      {field('Description (Arabic)', form.descriptionAr, (v) => setForm({ ...form, descriptionAr: v }), { textarea: true })}

      <div className="space-y-2">
        <label className="text-[11px] font-heading text-[#E2E6E8]/70 uppercase tracking-wider block">
          Available Sizes / Out of Stock
        </label>
        <div className="flex flex-wrap gap-3">
          {ALL_SIZES.map((size) => {
            const included = form.sizes.includes(size);
            const outOfStock = form.outOfStockSizes.includes(size);
            return (
              <div key={size} className="flex items-center gap-1.5 border border-[#E2E6E8]/20 px-2.5 py-1.5">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={included} onChange={() => toggleSize(size)} className="accent-[#D8A065]" />
                  <span>{size}</span>
                </label>
                {included && (
                  <label className="flex items-center gap-1 text-[10px] text-[#E2E6E8]/60 cursor-pointer border-l border-[#E2E6E8]/20 pl-1.5">
                    <input
                      type="checkbox"
                      checked={outOfStock}
                      onChange={() => toggleOutOfStock(size)}
                      className="accent-red-500"
                    />
                    <span>Sold out</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-lahab-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Piece'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border border-[#E2E6E8]/25 text-xs text-[#E2E6E8]/70 hover:text-[#E2E6E8] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
