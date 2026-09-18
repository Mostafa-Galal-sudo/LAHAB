import React, { useState, useRef } from 'react';
import { Box, Trash2, Upload } from 'lucide-react';
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
  modelAssetId: '',
  modelFileName: '',
  modelFormat: 'obj' as 'obj' | 'glb',
  modelScale: ['1', '1', '1'],
  modelPosition: ['0', '0', '0'],
  modelRotation: ['0', '0', '0'],
  modelCameraPosition: ['0', '0.4', '4.2'],
  modelAutoRotate: true,
  modelAutoRotateSpeed: '1',
  modelBackgroundColor: '#0A1422',
  modelLightingPreset: 'studio' as 'studio' | 'softbox' | 'dramatic' | 'neutral',
  modelMaterialColor: '',
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
      modelAssetId: initial.model3d?.assetId || '',
      modelFileName: initial.model3d?.assetId || '',
      modelFormat: initial.model3d?.format || ('obj' as const),
      modelScale: (initial.model3d?.scale || [1, 1, 1]).map(String),
      modelPosition: (initial.model3d?.position || [0, 0, 0]).map(String),
      modelRotation: (initial.model3d?.rotation || [0, 0, 0]).map(String),
      modelCameraPosition: (initial.model3d?.cameraPosition || [0, 0.4, 4.2]).map(String),
      modelAutoRotate: initial.model3d?.autoRotate ?? true,
      modelAutoRotateSpeed: String(initial.model3d?.autoRotateSpeed ?? 1),
      modelBackgroundColor: initial.model3d?.backgroundColor || '#0A1422',
      modelLightingPreset: initial.model3d?.lightingPreset || ('studio' as const),
      modelMaterialColor: initial.model3d?.materialColor || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [modelUploading, setModelUploading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');

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
    setUploadNotice('');

    const price = Number(form.priceEGP);
    if (!form.code || !form.nameEn || !form.nameAr || !price || price <= 0 || form.sizes.length === 0) {
      setError('Please fill in code, name (EN/AR), a valid price, and at least one size.');
      return;
    }

    setSaving(true);
    try {
      const numberVector = (values: string[]) => values.map(Number) as [number, number, number];
      const model3d = form.modelAssetId ? {
        assetId: form.modelAssetId,
        format: form.modelFormat,
        scale: numberVector(form.modelScale),
        position: numberVector(form.modelPosition),
        rotation: numberVector(form.modelRotation),
        cameraPosition: numberVector(form.modelCameraPosition),
        autoRotate: form.modelAutoRotate,
        autoRotateSpeed: Number(form.modelAutoRotateSpeed),
        backgroundColor: form.modelBackgroundColor,
        lightingPreset: form.modelLightingPreset,
        ...(form.modelMaterialColor ? { materialColor: form.modelMaterialColor } : {}),
      } : null;
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
        model3d,
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
  const modelFileInputRef = useRef<HTMLInputElement>(null);

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
      setUploadNotice(asset.metadata.source === 'github' ? 'Image committed to GitHub and attached to this piece.' : 'Image uploaded.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleModelFileSelect = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'obj' && extension !== 'glb') {
      setError('Please select an OBJ or GLB 3D model.');
      return;
    }
    setError('');
    setUploadNotice('');
    setModelUploading(true);
    setModelProgress(0);
    try {
      const asset = await uploadAsset(file, 'model', setModelProgress);
      setForm((prev) => ({
        ...prev,
        modelAssetId: asset.id,
        modelFileName: asset.fileName,
        modelFormat: extension,
      }));
      setUploadNotice(asset.metadata.source === 'github' ? '3D model committed to GitHub and attached to this piece.' : '3D model uploaded.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '3D model upload failed.');
    } finally {
      setModelUploading(false);
      if (modelFileInputRef.current) modelFileInputRef.current.value = '';
    }
  };

  const vectorFields = (
    label: string,
    values: string[],
    update: (values: string[]) => void,
  ) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-heading text-[#E2E6E8]/65 uppercase tracking-wider block">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {(['X', 'Y', 'Z'] as const).map((axis, index) => (
          <label key={axis} className="flex items-center border border-[#E2E6E8]/20 bg-[#0A1422] focus-within:border-[#D8A065]">
            <span className="px-2 text-[9px] font-mono text-[#D8A065]">{axis}</span>
            <input
              type="number"
              step="0.05"
              value={values[index]}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                update(next);
              }}
              className="min-w-0 w-full bg-transparent py-2 pr-2 text-xs text-[#E2E6E8] focus:outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-[#132238]/50 border border-[#D8A065]/30 p-5 sm:p-6">
      <h2 className="font-heading text-sm text-[#D8A065] uppercase tracking-wider">
        {initial ? 'Edit Piece' : 'Add New Piece'}
      </h2>

      {error && <div className="p-3 border border-red-500/60 bg-red-950/40 text-red-300 text-xs">{error}</div>}
      {uploadNotice && <div className="p-3 border border-emerald-500/40 bg-emerald-950/25 text-emerald-200 text-xs" role="status">{uploadNotice}</div>}

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

      <div className="border border-[#D8A065]/50 bg-[#0D1929] p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#D8A065]">
              <Box className="w-4 h-4" />
              <span className="text-xs font-heading uppercase tracking-wider">Product 3D Model</span>
            </div>
            <p className="mt-1 text-[10px] text-[#E2E6E8]/55">Upload this piece’s OBJ or GLB. The storefront selector uses the stable asset ID.</p>
          </div>
          {form.modelAssetId && (
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, modelAssetId: '', modelFileName: '' }))}
              className="p-2 border border-red-500/30 text-red-300 hover:bg-red-950/50"
              title="Remove product model reference"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => modelFileInputRef.current?.click()}
          disabled={modelUploading}
          className="w-full py-3 px-4 border border-[#D8A065] text-[#D8A065] hover:bg-[#D8A065] hover:text-[#0D1929] disabled:opacity-50 transition-colors text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {modelUploading ? `Uploading model ${modelProgress}%` : form.modelAssetId ? 'Replace 3D Model' : 'Upload OBJ / GLB'}
        </button>
        <input
          ref={modelFileInputRef}
          type="file"
          accept=".obj,.glb,model/obj,model/gltf-binary"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleModelFileSelect(file);
          }}
        />

        {form.modelAssetId && (
          <div className="space-y-4 border-t border-[#E2E6E8]/15 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
              <span className="border border-emerald-500/40 text-emerald-300 px-2 py-1">{form.modelFormat.toUpperCase()}</span>
              <span className="text-[#E2E6E8]/70 break-all">{form.modelFileName}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vectorFields('Scale', form.modelScale, (value) => setForm({ ...form, modelScale: value }))}
              {vectorFields('Position', form.modelPosition, (value) => setForm({ ...form, modelPosition: value }))}
              {vectorFields('Rotation (radians)', form.modelRotation, (value) => setForm({ ...form, modelRotation: value }))}
              {vectorFields('Camera position', form.modelCameraPosition, (value) => setForm({ ...form, modelCameraPosition: value }))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="space-y-1 text-[10px] uppercase tracking-wider text-[#E2E6E8]/65">
                <span>Lighting</span>
                <select value={form.modelLightingPreset} onChange={(e) => setForm({ ...form, modelLightingPreset: e.target.value as typeof form.modelLightingPreset })} className="w-full bg-[#0A1422] border border-[#E2E6E8]/20 px-2 py-2 text-xs text-[#E2E6E8]">
                  <option value="studio">Studio</option><option value="softbox">Softbox</option><option value="dramatic">Dramatic</option><option value="neutral">Neutral</option>
                </select>
              </label>
              <label className="space-y-1 text-[10px] uppercase tracking-wider text-[#E2E6E8]/65">
                <span>Orbit speed</span>
                <input type="number" min="0" max="20" step="0.1" value={form.modelAutoRotateSpeed} onChange={(e) => setForm({ ...form, modelAutoRotateSpeed: e.target.value })} className="w-full bg-[#0A1422] border border-[#E2E6E8]/20 px-2 py-2 text-xs text-[#E2E6E8]" />
              </label>
              <label className="space-y-1 text-[10px] uppercase tracking-wider text-[#E2E6E8]/65">
                <span>Background</span>
                <input type="color" value={form.modelBackgroundColor} onChange={(e) => setForm({ ...form, modelBackgroundColor: e.target.value.toUpperCase() })} className="w-full h-9 bg-[#0A1422] border border-[#E2E6E8]/20 p-1" />
              </label>
              <label className="space-y-1 text-[10px] uppercase tracking-wider text-[#E2E6E8]/65">
                <span>Material tint (optional)</span>
                <div className="flex gap-1">
                  <input type="color" value={form.modelMaterialColor || '#0F1C2D'} onChange={(e) => setForm({ ...form, modelMaterialColor: e.target.value.toUpperCase() })} className="w-full h-9 bg-[#0A1422] border border-[#E2E6E8]/20 p-1" />
                  <button type="button" onClick={() => setForm({ ...form, modelMaterialColor: '' })} className="px-2 border border-[#E2E6E8]/20 text-[#E2E6E8]/60">Clear</button>
                </div>
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#E2E6E8]/80">
              <input type="checkbox" checked={form.modelAutoRotate} onChange={(e) => setForm({ ...form, modelAutoRotate: e.target.checked })} className="accent-[#D8A065]" />
              Auto-rotate this model in the storefront viewer
            </label>
          </div>
        )}
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
