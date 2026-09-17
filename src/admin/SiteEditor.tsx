import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, History, Monitor, Plus, Redo2, RotateCcw, Save, Smartphone, Tablet, Trash2, Undo2, UploadCloud } from 'lucide-react';
import type { PageDocument, PageSection, PageSectionType } from '../../shared/pageSchema';
import { validatePageDocument } from '../../shared/pageSchemaValidation';
import {
  ApiError,
  getPageDraft,
  getPageRevision,
  getPageRevisions,
  publishPageRevision,
  restorePageRevision,
  savePageDraft,
  type PageRevisionSummary,
} from '../lib/api';
import type { Language } from '../translations';
import type { EditorPreviewBridge, EditorToPreviewMessage, EditorViewport, PreviewToEditorMessage } from '../pageBuilder/editorMessages';
import { collectEditableLeaves, createSection, deepClone, getAtPath, moveInArray, nestedArrays, regenerateIds, setAtPath, type EditorPath } from './pageEditorUtils';
import AssetLibrary from './AssetLibrary';

type SaveStatus = 'saved' | 'dirty' | 'saving' | 'conflict' | 'error';
interface HistoryState { past: PageDocument[]; present: PageDocument; future: PageDocument[] }

const SECTION_TYPES: PageSectionType[] = ['hero', 'calligraphicBanner', 'brandStory', 'editorialLookbook', 'productShowcase', 'garmentViewer', 'productReviews', 'streetStyleLookbook', 'serialVerifier', 'archivalVault', 'faq', 'contact', 'footer'];
const SELECT_OPTIONS: Record<string, string[]> = {
  paddingTop: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  paddingBottom: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  contentWidth: ['narrow', 'standard', 'wide', 'full'],
  textAlign: ['start', 'center', 'end'],
  headingFamily: ['heading', 'body', 'mono'],
  headingScale: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'display'],
  headingWeight: ['normal', 'medium', 'semibold', 'bold', 'black'],
  format: ['obj', 'glb'],
  lightingPreset: ['studio', 'softbox', 'dramatic', 'neutral'],
  region: ['cairo', 'dubai', 'london', 'other'],
  emphasis: ['normal', 'accent', 'muted'],
};

const viewportWidth: Record<EditorViewport, string> = { desktop: '100%', tablet: '768px', mobile: '390px' };
const shortId = (id: string) => id.length > 12 ? `${id.slice(0, 8)}…` : id;

const SiteEditor: React.FC = () => {
  const [history, setHistory] = useState<HistoryState | null>(null);
  const [draftRevisionId, setDraftRevisionId] = useState<string | null>(null);
  const [publishedRevisionId, setPublishedRevisionId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<PageRevisionSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [viewport, setViewport] = useState<EditorViewport>('desktop');
  const [language, setLanguage] = useState<Language>('en');
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [previewOverride, setPreviewOverride] = useState<PageDocument | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const page = history?.present ?? null;
  const selectedIndex = page?.sections.findIndex((section) => section.id === selectedId) ?? -1;
  const selected = selectedIndex >= 0 ? page!.sections[selectedIndex] : undefined;

  const refreshRevisions = useCallback(() => getPageRevisions('home').then(setRevisions), []);
  const loadDraft = useCallback(async () => {
    try {
      const result = await getPageDraft('home');
      setHistory({ past: [], present: result.page, future: [] });
      setDraftRevisionId(result.revisionId);
      setPublishedRevisionId(result.publishedRevisionId);
      setSelectedId(result.page.sections[0]?.id);
      setPreviewOverride(null);
      setStatus('saved');
      await refreshRevisions();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to load the homepage draft.');
    }
  }, [refreshRevisions]);

  useEffect(() => { loadDraft(); }, [loadDraft]);

  const commit = useCallback((next: PageDocument) => {
    setHistory((current) => current ? { past: [...current.past, current.present].slice(-100), present: next, future: [] } : current);
    setPreviewOverride(null);
    setStatus('dirty');
  }, []);

  const undo = () => setHistory((current) => {
    if (!current?.past.length) return current;
    const present = current.past[current.past.length - 1];
    setStatus('dirty');
    return { past: current.past.slice(0, -1), present, future: [current.present, ...current.future] };
  });
  const redo = () => setHistory((current) => {
    if (!current?.future.length) return current;
    const [present, ...future] = current.future;
    setStatus('dirty');
    return { past: [...current.past, current.present], present, future };
  });

  const postPreview = useCallback(() => {
    const previewPage = previewOverride ?? page;
    if (!previewPage || !iframeRef.current?.contentWindow) return;
    const payload: EditorToPreviewMessage = { type: 'lahab:preview-document', page: previewPage, language, selectedSectionId: selectedId };
    iframeRef.current.contentWindow.postMessage(payload, window.location.origin);
  }, [language, page, previewOverride, selectedId]);

  useEffect(() => { postPreview(); }, [postPreview]);
  useEffect(() => {
    const editorWindow = window as Window & { __LAHAB_EDITOR_PREVIEW__?: EditorPreviewBridge };
    editorWindow.__LAHAB_EDITOR_PREVIEW__ = {
      selectSection: (sectionId) => {
        if (!page?.sections.some((section) => section.id === sectionId)) return;
        setSelectedId(sectionId);
        setPreviewOverride(null);
      },
    };
    const onMessage = (event: MessageEvent<PreviewToEditorMessage>) => {
      const message = event.data;
      if (message?.type === 'lahab:preview-ready') postPreview();
      if (message?.type === 'lahab:preview-select') {
        if (!page?.sections.some((section) => section.id === message.sectionId)) return;
        setSelectedId(message.sectionId);
        setPreviewOverride(null);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      delete editorWindow.__LAHAB_EDITOR_PREVIEW__;
    };
  }, [page?.sections, postPreview]);

  const save = async () => {
    if (!page) return false;
    const validation = validatePageDocument(page);
    if (!validation.valid) {
      setStatus('error');
      setMessage(validation.errors[0] ?? 'The page document is invalid.');
      return false;
    }
    setStatus('saving');
    try {
      const result = await savePageDraft('home', page, draftRevisionId);
      setDraftRevisionId(result.revisionId);
      setPublishedRevisionId(result.publishedRevisionId);
      setHistory({ past: [], present: result.page, future: [] });
      setStatus('saved');
      setMessage('Draft saved as a new revision.');
      await refreshRevisions();
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setStatus('conflict');
        setMessage('Another editor saved first. Your unsaved work is still here. Reload the latest draft to reconcile.');
      } else {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Draft save failed.');
      }
      return false;
    }
  };

  const publish = async () => {
    let revisionId = draftRevisionId;
    if (status !== 'saved') {
      const saved = await save();
      if (!saved) return;
      const latest = await getPageDraft('home');
      revisionId = latest.revisionId;
      setDraftRevisionId(latest.revisionId);
    }
    if (!revisionId) return;
    try {
      await publishPageRevision('home', revisionId, revisionId);
      setPublishedRevisionId(revisionId);
      setMessage('Published the exact saved revision.');
      await refreshRevisions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Publish failed.');
    }
  };

  const updateLeaf = (path: EditorPath, raw: string | boolean) => {
    if (!page) return;
    const current = getAtPath(page, path);
    let value: unknown = raw;
    if (typeof current === 'number') value = Number(raw);
    if (typeof current === 'boolean') value = Boolean(raw);
    commit(setAtPath(page, path, value));
  };

  const replaceSections = (sections: PageSection[]) => page && commit({ ...deepClone(page), sections });
  const moveSection = (from: number, to: number) => replaceSections(moveInArray(page!.sections, from, to));

  const duplicateSection = (index: number) => {
    const clone = regenerateIds(page!.sections[index]);
    replaceSections([...page!.sections.slice(0, index + 1), clone, ...page!.sections.slice(index + 1)]);
    setSelectedId(clone.id);
  };
  const deleteSection = (index: number) => {
    if (!window.confirm(`Delete ${page!.sections[index].type} from this draft?`)) return;
    const sections = page!.sections.filter((_, itemIndex) => itemIndex !== index);
    replaceSections(sections);
    setSelectedId(sections[Math.min(index, sections.length - 1)]?.id);
  };

  const addSection = (type: PageSectionType) => {
    const section = createSection(type);
    replaceSections([...page!.sections, section]);
    setSelectedId(section.id);
  };

  const updateNested = (key: string, items: unknown[]) => {
    if (!page || selectedIndex < 0) return;
    commit(setAtPath(page, ['sections', selectedIndex, 'content', key], items));
  };

  const inspectRevision = async (revisionId: string) => {
    const revision = await getPageRevision('home', revisionId);
    setPreviewOverride(revision.page);
    setMessage(`Previewing revision ${shortId(revisionId)}. Your working draft is unchanged.`);
  };
  const restoreRevision = async (revisionId: string) => {
    try {
      const result = await restorePageRevision('home', revisionId, draftRevisionId);
      setHistory({ past: [], present: result.page, future: [] });
      setDraftRevisionId(result.revisionId);
      setPreviewOverride(null);
      setStatus('saved');
      setMessage(`Restored ${shortId(revisionId)} as a new draft.`);
      await refreshRevisions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Restore failed.');
    }
  };
  const rollback = async (revisionId: string) => {
    if (!window.confirm('Publish this historical revision as the live rollback target?')) return;
    try {
      await publishPageRevision('home', revisionId, draftRevisionId);
      setPublishedRevisionId(revisionId);
      setMessage(`Published historical revision ${shortId(revisionId)}.`);
      await refreshRevisions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Rollback publish failed.');
    }
  };

  const leaves = useMemo(() => selected && selectedIndex >= 0
    ? collectEditableLeaves({ content: selected.content, style: selected.style, responsive: selected.responsive }, ['sections', selectedIndex])
    : [], [selected, selectedIndex]);

  if (!page || !history) return <div className="min-h-[60vh] grid place-items-center font-heading text-[#D8A065] tracking-widest">LOADING PAGE WORKSPACE</div>;

  return (
    <section className="fixed inset-x-0 top-[69px] bottom-0 bg-[#070E18] z-30 flex flex-col overflow-hidden" aria-label="Site editor">
      <div className="h-14 border-b border-[#D8A065]/30 bg-[#0D1929] px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          {(['desktop', 'tablet', 'mobile'] as EditorViewport[]).map((device) => {
            const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
            return <button key={device} onClick={() => setViewport(device)} aria-label={`${device} preview`} className={`p-2 border ${viewport === device ? 'border-[#D8A065] text-[#D8A065] bg-[#D8A065]/10' : 'border-transparent text-[#E2E6E8]/50'}`}><Icon className="w-4 h-4" /></button>;
          })}
          <div className="h-5 w-px bg-[#E2E6E8]/15 mx-1" />
          <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-mono ${language === 'en' ? 'text-[#D8A065]' : 'text-[#E2E6E8]/50'}`}>EN</button>
          <button onClick={() => setLanguage('ar')} className={`px-2 py-1 text-xs font-mono ${language === 'ar' ? 'text-[#D8A065]' : 'text-[#E2E6E8]/50'}`}>AR</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!history.past.length} aria-label="Undo" className="p-2 disabled:opacity-25"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={!history.future.length} aria-label="Redo" className="p-2 disabled:opacity-25"><Redo2 className="w-4 h-4" /></button>
          <button onClick={() => setShowAssets(true)} className="px-3 py-2 border border-[#E2E6E8]/20 text-xs font-heading flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Assets</button>
          <button onClick={() => setShowHistory((value) => !value)} className="px-3 py-2 border border-[#E2E6E8]/20 text-xs font-heading flex items-center gap-2"><History className="w-4 h-4" /> History</button>
          <button onClick={save} disabled={status === 'saving'} className="px-3 py-2 border border-[#D8A065] text-[#D8A065] text-xs font-heading flex items-center gap-2"><Save className="w-4 h-4" /> Save draft</button>
          <button onClick={publish} className="btn-lahab-primary px-4 py-2 text-xs">Publish</button>
          <span data-editor-status={status} className={`text-[10px] font-mono uppercase px-2 py-1 border ${status === 'conflict' || status === 'error' ? 'text-red-300 border-red-500/40' : status === 'saved' ? 'text-emerald-300 border-emerald-500/30' : 'text-[#D8A065] border-[#D8A065]/30'}`}>{status === 'dirty' ? 'Unsaved changes' : status}</span>
        </div>
      </div>

      {message && <div className="px-4 py-2 bg-[#132238] border-b border-[#E2E6E8]/10 text-xs font-mono flex justify-between"><span>{message}</span>{status === 'conflict' && <button onClick={loadDraft} className="text-[#D8A065] underline">Reload latest draft</button>}</div>}

      <div className="flex-1 grid grid-cols-[260px_minmax(0,1fr)_320px] min-h-0">
        <aside className="border-r border-[#E2E6E8]/15 bg-[#0D1929] overflow-y-auto p-3" aria-label="Page structure">
          <div className="flex justify-between items-center mb-3"><h2 className="font-heading text-xs text-[#D8A065] tracking-widest">PAGE STRUCTURE</h2><span className="text-[10px] font-mono text-[#E2E6E8]/40">{page.sections.length}</span></div>
          <div className="space-y-1">
            {page.sections.map((section, index) => (
              <div key={section.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null && dragIndex !== index) moveSection(dragIndex, index); setDragIndex(null); }} className={`group border ${selectedId === section.id ? 'border-[#D8A065] bg-[#D8A065]/10' : 'border-[#E2E6E8]/10 bg-[#132238]/40'}`}>
                <button onClick={() => { setSelectedId(section.id); setPreviewOverride(null); }} className="w-full flex items-center gap-2 p-2 text-left"><GripVertical className="w-3.5 h-3.5 text-[#E2E6E8]/30" /><span className="flex-1 text-[11px] font-heading truncate">{section.type}</span><span className="text-[9px] font-mono text-[#E2E6E8]/35">{index + 1}</span></button>
                <div className="flex border-t border-[#E2E6E8]/10 justify-end p-1 gap-1">
                  <button aria-label={section.visible ? 'Hide section' : 'Show section'} onClick={() => commit(setAtPath(page, ['sections', index, 'visible'], !section.visible))} className="p-1">{section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                  <button aria-label="Move section up" disabled={index === 0} onClick={() => moveSection(index, index - 1)} className="p-1 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button aria-label="Move section down" disabled={index === page.sections.length - 1} onClick={() => moveSection(index, index + 1)} className="p-1 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button aria-label="Duplicate section" onClick={() => duplicateSection(index)} className="p-1"><Copy className="w-3.5 h-3.5" /></button>
                  <button aria-label="Delete section" onClick={() => deleteSection(index)} className="p-1 text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 border border-dashed border-[#D8A065]/40 p-2 text-[11px] text-[#D8A065]"><Plus className="w-4 h-4" /><select aria-label="Add section" value="" onChange={(event) => event.target.value && addSection(event.target.value as PageSectionType)} className="bg-transparent flex-1 outline-none"><option value="" className="bg-[#0D1929]">Add section…</option>{SECTION_TYPES.map((type) => <option key={type} value={type} className="bg-[#0D1929]">{type}</option>)}</select></label>
        </aside>

        <main className="bg-[#090F19] overflow-auto p-5 flex justify-center" aria-label="Live website preview">
          <div className="h-full transition-[width] duration-300 bg-white shadow-2xl border border-[#D8A065]/25" style={{ width: viewportWidth[viewport], minWidth: viewport === 'desktop' ? '920px' : undefined }}>
            <iframe ref={iframeRef} title="Draft storefront preview" src="/editor-preview?page=home&mode=draft" sandbox="allow-scripts allow-same-origin" onLoad={postPreview} className="w-full h-full border-0" />
          </div>
        </main>

        <aside className="border-l border-[#E2E6E8]/15 bg-[#0D1929] overflow-y-auto p-4" aria-label="Properties inspector">
          {selected ? <>
            <div className="border-b border-[#E2E6E8]/15 pb-3 mb-4"><div className="text-[10px] font-mono text-[#D8A065] uppercase">Selected section</div><h2 className="font-heading text-lg">{selected.type}</h2><code className="text-[9px] text-[#E2E6E8]/35">{selected.id}</code></div>
            <label className="flex items-center justify-between mb-4 text-xs"><span>Visible</span><input type="checkbox" checked={selected.visible} onChange={(event) => commit(setAtPath(page, ['sections', selectedIndex, 'visible'], event.target.checked))} /></label>
            <div className="space-y-3">
              {leaves.map((field) => {
                const key = String(field.path[field.path.length - 1]);
                const options = SELECT_OPTIONS[key];
                const isHex = /color/i.test(key) && typeof field.value === 'string' && field.value.startsWith('#');
                return <label key={field.path.join('.')} className="block space-y-1"><span className="text-[10px] font-mono text-[#E2E6E8]/55 break-all">{field.label.replace(`sections / ${selectedIndex} / `, '')}</span>
                  {typeof field.value === 'boolean' ? <input type="checkbox" checked={field.value} onChange={(event) => updateLeaf(field.path, event.target.checked)} />
                    : options ? <select value={String(field.value)} onChange={(event) => updateLeaf(field.path, event.target.value)} className="w-full bg-[#132238] border border-[#E2E6E8]/20 p-2 text-xs">{options.map((option) => <option key={option}>{option}</option>)}</select>
                    : <div className="flex gap-2">{isHex && <input aria-label={`${field.label} color`} type="color" value={String(field.value)} onChange={(event) => updateLeaf(field.path, event.target.value)} className="w-9 h-9 bg-transparent" />}<input value={String(field.value)} type={typeof field.value === 'number' ? 'number' : 'text'} onChange={(event) => updateLeaf(field.path, event.target.value)} className="w-full bg-[#132238] border border-[#E2E6E8]/20 p-2 text-xs" /></div>}
                </label>;
              })}
            </div>
            {nestedArrays(selected).map(({ key, items }) => <div key={key} className="mt-5 border-t border-[#E2E6E8]/15 pt-3"><div className="flex justify-between text-[10px] font-heading text-[#D8A065] mb-2"><span>{key}</span><span>{items.length}</span></div>{items.map((item, index) => {
              const record = item as Record<string, unknown>; return <div key={String(record.id ?? index)} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null) updateNested(key, moveInArray(items, dragIndex, index)); setDragIndex(null); }} className="flex items-center gap-1 border border-[#E2E6E8]/10 p-2 mb-1 text-[10px]"><GripVertical className="w-3 h-3" /><span className="flex-1 truncate">{String(record.id ?? `${key} ${index + 1}`)}</span>{typeof record.visible === 'boolean' && <button aria-label={record.visible ? 'Hide item' : 'Show item'} onClick={() => { const next = deepClone(items); (next[index] as Record<string, unknown>).visible = !record.visible; updateNested(key, next); }}>{record.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>}<button aria-label="Move item up" disabled={index === 0} onClick={() => updateNested(key, moveInArray(items, index, index - 1))} className="disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button><button aria-label="Move item down" disabled={index === items.length - 1} onClick={() => updateNested(key, moveInArray(items, index, index + 1))} className="disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button><button aria-label="Duplicate item" onClick={() => updateNested(key, [...items.slice(0, index + 1), regenerateIds(item), ...items.slice(index + 1)])}><Copy className="w-3 h-3" /></button><button aria-label="Delete item" onClick={() => updateNested(key, items.filter((_, itemIndex) => itemIndex !== index))} className="text-red-300"><Trash2 className="w-3 h-3" /></button></div>;
            })}{items.length > 0 && <button onClick={() => updateNested(key, [...items, regenerateIds(items[items.length - 1])])} className="mt-1 text-[10px] text-[#D8A065] flex items-center gap-1"><Plus className="w-3 h-3" /> Add item</button>}</div>)}
          </> : <p className="text-xs text-[#E2E6E8]/40">Select a section in the preview or tree.</p>}
        </aside>
      </div>

      {showHistory && <div className="absolute inset-y-14 right-0 w-[420px] bg-[#0D1929] border-l border-[#D8A065]/30 z-50 overflow-y-auto p-4 shadow-2xl"><div className="flex justify-between mb-4"><h2 className="font-heading text-[#D8A065]">REVISION ARCHIVE</h2><button onClick={() => setShowHistory(false)}>×</button></div><div className="space-y-2">{revisions.map((revision) => <div key={revision.id} className="border border-[#E2E6E8]/15 bg-[#132238]/40 p-3 text-xs"><div className="flex justify-between"><code>{shortId(revision.id)}</code><span>{new Date(revision.createdAt).toLocaleString()}</span></div><div className="text-[10px] text-[#E2E6E8]/50 mt-1">{revision.creatorUsername ?? 'system'} {revision.id === draftRevisionId && '• CURRENT DRAFT'} {revision.id === publishedRevisionId && '• LIVE'}</div><div className="flex gap-2 mt-3"><button onClick={() => inspectRevision(revision.id)} className="border px-2 py-1">Preview</button><button onClick={() => restoreRevision(revision.id)} className="border px-2 py-1"><RotateCcw className="w-3 h-3 inline" /> Restore</button><button onClick={() => rollback(revision.id)} className="border border-[#D8A065] text-[#D8A065] px-2 py-1">Publish</button></div></div>)}</div></div>}
      {showAssets && <AssetLibrary onClose={() => setShowAssets(false)} onSelect={(asset) => { if (selected && selectedIndex >= 0) { const firstAsset = leaves.find((leaf) => String(leaf.path[leaf.path.length - 1]) === 'assetId'); if (firstAsset) updateLeaf(firstAsset.path, asset.id); } setShowAssets(false); }} />}
    </section>
  );
};

export default SiteEditor;
