import React, { type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Cookie, Mail, RefreshCw, Settings2, ShieldCheck, WifiOff, Wrench } from 'lucide-react';
import Wordmark from '../components/Wordmark';
import { policyByPath, type PolicyDocument } from './siteContent';

const UPDATED = '18 September 2026';
const CONSENT_KEY = 'lahab_cookie_preferences_v1';
export const OPEN_COOKIE_PREFERENCES = 'lahab:open-cookie-preferences';

const legalLinks = [
  ['/privacy-policy', 'Privacy'], ['/terms', 'Terms'], ['/cookie-policy', 'Cookies'],
  ['/shipping-policy', 'Shipping'], ['/returns-refunds', 'Returns'], ['/payment-policy', 'Payments'],
] as const;

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09111C] text-[#E2E6E8] font-body selection:bg-[#D8A065] selection:text-[#09111C]">
      <header className="sticky top-0 z-30 border-b border-[#D8A065]/25 bg-[#09111C]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-4">
          <a href="/" aria-label="LAHAB home"><Wordmark size="sm" /></a>
          <a href="/" className="inline-flex items-center gap-2 text-xs text-[#D8A065] hover:text-[#E2E6E8] focus-visible:outline-2 focus-visible:outline-[#D8A065]">
            <ArrowLeft className="w-4 h-4" /> Return to the collection
          </a>
        </div>
      </header>
      {children}
      <footer className="border-t border-[#E2E6E8]/15 bg-[#070E18]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col md:flex-row justify-between gap-6 text-xs text-[#E2E6E8]/60">
          <span>© 2026 LAHAB. All rights reserved.</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal pages">
            {legalLinks.map(([href, label]) => <a key={href} href={href} className="hover:text-[#D8A065]">{label}</a>)}
            <a href="/contact" className="hover:text-[#D8A065]">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function PolicyPage({ document }: { document: PolicyDocument }) {
  return (
    <PageFrame>
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="border-l-2 border-[#D8A065] pl-5 sm:pl-8 mb-14">
          <p className="text-xs text-[#D8A065] font-mono">LAHAB ATELIER RECORD</p>
          <h1 className="font-heading text-4xl sm:text-6xl text-[#E2E6E8] mt-3 leading-tight">{document.title}</h1>
          <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-[#E2E6E8]/72">{document.summary}</p>
          <p className="mt-5 text-[11px] font-mono text-[#E2E6E8]/45">Effective: {UPDATED}</p>
        </div>
        <div className="space-y-5">
          {document.sections.map((section) => (
            <section key={section.title} className="border border-[#E2E6E8]/15 bg-[#0D1929] p-5 sm:p-8">
              <h2 className="font-heading text-xl sm:text-2xl text-[#D8A065]">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 text-sm leading-7 text-[#E2E6E8]/78 max-w-3xl">{paragraph}</p>)}
              {section.bullets && <ul className="mt-4 space-y-3 text-sm leading-6 text-[#E2E6E8]/78">{section.bullets.map((item) => <li key={item} className="flex gap-3"><span className="text-[#D8A065]">◆</span><span>{item}</span></li>)}</ul>}
            </section>
          ))}
        </div>
        {document.path === '/cookie-policy' && <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES))} className="mt-8 btn-lahab-outline px-5 py-3 text-xs font-bold inline-flex items-center gap-2"><Settings2 className="w-4 h-4" /> Cookie preferences</button>}
      </main>
    </PageFrame>
  );
}

export function ContactPage() {
  return (
    <PageFrame>
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs text-[#D8A065] font-mono">ATELIER CONCIERGE</p>
        <h1 className="font-heading text-5xl sm:text-7xl mt-3">Contact LAHAB</h1>
        <p className="mt-6 max-w-2xl text-[#E2E6E8]/70 leading-7">Order support, sizing guidance, returns, press, and bespoke requests are handled directly by the atelier.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-12">
          <a href="mailto:lahabfire@gmail.com" className="border border-[#D8A065]/45 bg-[#0D1929] p-7 hover:border-[#D8A065] focus-visible:outline-2 focus-visible:outline-[#D8A065]">
            <Mail className="w-6 h-6 text-[#D8A065]" /><h2 className="font-heading text-2xl mt-5">Email</h2><p className="text-sm text-[#E2E6E8]/65 mt-2">lahabfire@gmail.com</p>
          </a>
          <a href="https://wa.me/201288224920" target="_blank" rel="noopener noreferrer" className="border border-[#D8A065]/45 bg-[#0D1929] p-7 hover:border-[#D8A065] focus-visible:outline-2 focus-visible:outline-[#D8A065]">
            <ShieldCheck className="w-6 h-6 text-[#D8A065]" /><h2 className="font-heading text-2xl mt-5">WhatsApp</h2><p className="text-sm text-[#E2E6E8]/65 mt-2">+20 128 822 4920</p>
          </a>
        </div>
        <p className="mt-8 text-xs text-[#E2E6E8]/50">Include your order code when contacting us about an existing order.</p>
      </main>
    </PageFrame>
  );
}

type StatusKind = '404' | '500' | 'offline' | 'maintenance';
const statusContent: Record<StatusKind, { code: string; title: string; body: string; icon: typeof AlertTriangle }> = {
  '404': { code: '404', title: 'This route left no trace.', body: 'The page may have moved, expired, or never belonged to the archive.', icon: AlertTriangle },
  '500': { code: '500', title: 'The archive engine stalled.', body: 'The storefront encountered an unexpected error. Your cart remains stored; reload or return home.', icon: Wrench },
  offline: { code: 'OFFLINE', title: 'The signal has gone quiet.', body: 'Reconnect to the network, then retry. Previously loaded browser data remains on this device.', icon: WifiOff },
  maintenance: { code: 'SERVICE', title: 'The atelier is recalibrating.', body: 'A short maintenance window is in progress. Return shortly for full storefront access.', icon: Wrench },
};

export function StatusPage({ kind }: { kind: StatusKind }) {
  const content = statusContent[kind];
  const Icon = content.icon;
  return (
    <PageFrame>
      <main className="min-h-[72vh] grid place-items-center px-5 py-16">
        <div className="max-w-2xl w-full border border-[#D8A065]/40 bg-[#0D1929] p-7 sm:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 font-heading text-[9rem] leading-none text-[#D8A065]/5 select-none">{content.code}</div>
          <Icon className="w-9 h-9 text-[#D8A065] relative" />
          <p className="mt-8 text-xs font-mono text-[#D8A065]">SYSTEM RECORD // {content.code}</p>
          <h1 className="font-heading text-4xl sm:text-6xl mt-3 relative">{content.title}</h1>
          <p className="mt-5 text-sm sm:text-base leading-7 text-[#E2E6E8]/70 max-w-xl relative">{content.body}</p>
          <div className="mt-9 flex flex-wrap gap-3 relative">
            <a href="/" className="btn-lahab-primary px-6 py-3 text-xs font-bold">Return home</a>
            {(kind === '500' || kind === 'offline') && <button type="button" onClick={() => window.location.reload()} className="btn-lahab-outline px-6 py-3 text-xs font-bold inline-flex gap-2 items-center"><RefreshCw className="w-4 h-4" />Retry</button>}
          </div>
        </div>
      </main>
    </PageFrame>
  );
}

interface ConsentPreferences { analytics: boolean; marketing: boolean; }
function readConsent(): ConsentPreferences | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return { analytics: parsed.analytics === true, marketing: parsed.marketing === true };
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [initialConsent] = useState(readConsent);
  const [saved, setSaved] = useState(initialConsent !== null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(initialConsent ?? { analytics: false, marketing: false });
  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES, open);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES, open);
  }, []);
  const save = (next: ConsentPreferences) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ necessary: true, ...next, updatedAt: new Date().toISOString() }));
    } catch {
      // The controls still apply for this session when storage is unavailable.
    }
    setPreferences(next); setSaved(true); setPreferencesOpen(false);
  };
  return (
    <>
      {!saved && !preferencesOpen && <aside className="fixed bottom-3 left-3 right-3 z-[90] max-w-3xl md:left-6 md:right-auto border border-[#D8A065]/55 bg-[#09111C]/98 shadow-2xl p-5 sm:p-6" aria-label="Cookie consent">
        <div className="flex gap-4"><Cookie className="w-5 h-5 text-[#D8A065] shrink-0" /><div><h2 className="font-heading text-lg text-[#E2E6E8]">Your privacy controls</h2><p className="mt-2 text-xs leading-5 text-[#E2E6E8]/70">Necessary storage keeps your bag and saved pieces working. Optional analytics and marketing remain off unless you allow them.</p></div></div>
        <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => save({ analytics: true, marketing: true })} className="btn-lahab-primary px-4 py-2 text-xs font-bold">Allow all</button><button onClick={() => save({ analytics: false, marketing: false })} className="btn-lahab-outline px-4 py-2 text-xs font-bold">Necessary only</button><button onClick={() => setPreferencesOpen(true)} className="px-4 py-2 text-xs text-[#D8A065] underline">Preferences</button></div>
      </aside>}
      {preferencesOpen && <div className="fixed inset-0 z-[100] bg-[#050A11]/85 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title">
        <div className="w-full max-w-lg border border-[#D8A065]/55 bg-[#0D1929] p-6 sm:p-8">
          <h2 id="cookie-preferences-title" className="font-heading text-2xl">Cookie preferences</h2>
          <p className="mt-2 text-xs text-[#E2E6E8]/65">Optional categories can be changed at any time.</p>
          <div className="mt-6 space-y-3">
            <label className="flex justify-between gap-4 border border-[#E2E6E8]/15 p-4"><span><strong className="text-sm">Necessary</strong><small className="block mt-1 text-[#E2E6E8]/55">Cart, wishlist, security, and consent records.</small></span><input type="checkbox" checked disabled aria-label="Necessary cookies always enabled" /></label>
            {(['analytics', 'marketing'] as const).map((key) => <label key={key} className="flex justify-between gap-4 border border-[#E2E6E8]/15 p-4"><span><strong className="text-sm capitalize">{key}</strong><small className="block mt-1 text-[#E2E6E8]/55">{key === 'analytics' ? 'Helps understand aggregate storefront usage.' : 'Controls optional campaign and advertising storage.'}</small></span><input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} className="accent-[#D8A065]" /></label>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => save(preferences)} className="btn-lahab-primary px-5 py-2.5 text-xs font-bold">Save preferences</button>{saved && <button onClick={() => setPreferencesOpen(false)} className="btn-lahab-outline px-5 py-2.5 text-xs font-bold">Cancel</button>}</div>
        </div>
      </div>}
    </>
  );
}

export function NetworkNotice() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const online = () => setOffline(false); const down = () => setOffline(true);
    window.addEventListener('online', online); window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', down); };
  }, []);
  return offline ? <a href="/offline" role="status" className="fixed top-3 left-1/2 -translate-x-1/2 z-[95] bg-[#D8A065] text-[#09111C] px-4 py-2 text-xs font-bold shadow-xl flex items-center gap-2"><WifiOff className="w-4 h-4" />Offline — view recovery steps</a> : null;
}

export function SeoManager({ path }: { path: string }) {
  useEffect(() => {
    const documentData = policyByPath.get(path);
    const titles: Record<string, string> = { '/contact': 'Contact LAHAB', '/offline': 'Offline', '/maintenance': 'Maintenance', '/500': 'Server Error' };
    const title = documentData?.title ?? titles[path] ?? (path === '/' ? 'Streetwear Heritage' : 'Page Not Found');
    const fullTitle = path === '/' ? 'LAHAB | Streetwear Heritage' : `${title} | LAHAB`;
    const description = documentData?.summary ?? 'LAHAB contemporary streetwear forged in Arabic calligraphic heritage.';
    const isStatusPage = path === '/500' || path === '/offline' || path === '/maintenance' || (!documentData && path !== '/' && path !== '/contact');
    const imageUrl = `${window.location.origin}/assets/images/lahab_drop01_archer_hoodie.png`;
    document.title = fullTitle;
    const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    setMeta('name', 'description', description);
    setMeta('name', 'robots', isStatusPage ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', window.location.href);
    setMeta('property', 'og:image', imageUrl);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${path}`;
  }, [path]);
  return null;
}

export class PublicErrorBoundary extends React.Component<{ children: ReactNode }, { failed: boolean }> {
  declare readonly props: { children: ReactNode };
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[LAHAB] Public UI error', error, info.componentStack); }
  render() { return this.state.failed ? <StatusPage kind="500" /> : this.props.children; }
}
