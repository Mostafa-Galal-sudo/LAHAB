import React, { useEffect, useRef, useState } from 'react';
import { Box, FileText, Image, Trash2, Upload, Video, X } from 'lucide-react';
import { ApiError, deleteAsset, getAssets, uploadAsset, type AssetKind, type AssetRecord } from '../lib/api';

interface AssetLibraryProps { onClose: () => void; onSelect: (asset: AssetRecord) => void }
const ACCEPT: Record<AssetKind, string> = { image: '.jpg,.jpeg,.png,.webp,.avif,.gif', model: '.obj,.glb', video: '.mp4,.webm', document: '.pdf' };

const AssetLibrary: React.FC<AssetLibraryProps> = ({ onClose, onSelect }) => {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [kind, setKind] = useState<AssetKind>('image');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const load = () => getAssets().then(setAssets).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load assets.')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const upload = async (file?: File) => {
    if (!file) return;
    setError(''); setProgress(0);
    try {
      const asset = await uploadAsset(file, kind, setProgress);
      setAssets((current) => [asset, ...current]);
      setProgress(null);
    } catch (reason) {
      setProgress(null);
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (asset: AssetRecord) => {
    if (!window.confirm(`Delete ${asset.fileName}? Referenced assets are protected automatically.`)) return;
    try {
      await deleteAsset(asset.id);
      setAssets((current) => current.filter((item) => item.id !== asset.id));
    } catch (reason) {
      setError(reason instanceof ApiError && reason.status === 409 ? reason.message : 'Asset deletion failed.');
    }
  };

  const icon = (assetKind: AssetKind) => assetKind === 'image' ? <Image className="w-5 h-5" /> : assetKind === 'model' ? <Box className="w-5 h-5" /> : assetKind === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />;

  return <div className="fixed inset-0 z-[80] bg-black/75 grid place-items-center p-6" role="dialog" aria-modal="true" aria-label="Asset library">
    <div className="w-full max-w-5xl max-h-[86vh] overflow-hidden bg-[#0D1929] border border-[#D8A065]/40 shadow-2xl flex flex-col">
      <header className="p-5 border-b border-[#E2E6E8]/15 flex justify-between items-center"><div><div className="text-[10px] font-mono text-[#D8A065]">R2 OBJECT STORAGE</div><h2 className="font-heading text-xl">ASSET LIBRARY</h2></div><button onClick={onClose} aria-label="Close asset library"><X /></button></header>
      <div className="p-4 border-b border-[#E2E6E8]/10 flex flex-wrap gap-3 items-center">
        <select aria-label="Asset kind" value={kind} onChange={(event) => setKind(event.target.value as AssetKind)} className="bg-[#132238] border border-[#E2E6E8]/20 p-2 text-xs">{(['image', 'model', 'video', 'document'] as AssetKind[]).map((value) => <option key={value}>{value}</option>)}</select>
        <input ref={inputRef} aria-label="Choose asset file" type="file" accept={ACCEPT[kind]} onChange={(event) => upload(event.target.files?.[0])} className="text-xs file:mr-3 file:bg-[#D8A065] file:text-[#0D1929] file:border-0 file:px-3 file:py-2" />
        {progress !== null && <div className="flex-1 min-w-40"><div className="h-1 bg-[#132238]"><div className="h-full bg-[#D8A065]" style={{ width: `${progress}%` }} /></div><span className="text-[10px] font-mono">Uploading {progress}%</span></div>}
      </div>
      {error && <div className="mx-4 mt-3 border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200">{error}</div>}
      <div className="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading ? <p className="text-sm text-[#E2E6E8]/50">Loading assets…</p> : assets.map((asset) => <article key={asset.id} className="border border-[#E2E6E8]/15 bg-[#132238]/50 overflow-hidden group">
          <button onClick={() => onSelect(asset)} className="w-full text-left">
            <div className="h-28 bg-[#070E18] grid place-items-center overflow-hidden">{asset.kind === 'image' ? <img src={asset.publicUrl} alt="" className="w-full h-full object-cover" /> : icon(asset.kind)}</div>
            <div className="p-3"><div className="text-[11px] font-heading truncate">{asset.fileName}</div><div className="text-[9px] font-mono text-[#E2E6E8]/45 mt-1">{asset.kind} • {(asset.byteSize / 1024).toFixed(1)} KB</div><code className="text-[8px] text-[#D8A065]/60 break-all">{asset.id}</code></div>
          </button>
          <button onClick={() => remove(asset)} className="w-full border-t border-[#E2E6E8]/10 p-2 text-[10px] text-red-300 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Delete safely</button>
        </article>)}
      </div>
    </div>
  </div>;
};

export default AssetLibrary;
