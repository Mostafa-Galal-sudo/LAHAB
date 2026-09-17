#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const cdpUrl = process.env.LAHAB_CDP_URL || 'http://127.0.0.1:9223';
const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
const username = process.env.LAHAB_TEST_ADMIN_USERNAME;
const password = process.env.LAHAB_TEST_ADMIN_PASSWORD;
const adminId = process.env.LAHAB_TEST_ADMIN_ID;
if (!username || !password || !adminId) throw new Error('Temporary local admin credentials are required.');
const vars = await readFile(new URL('../.dev.vars', import.meta.url), 'utf8');
const secret = vars.match(/^ADMIN_JWT_SECRET=(.+)$/m)?.[1]?.trim();
if (!secret) throw new Error('ADMIN_JWT_SECRET is missing from .dev.vars.');
const slugSource = await readFile(new URL('../shared/adminSlug.ts', import.meta.url), 'utf8');
const slug = slugSource.match(/ADMIN_PATH_SLUG\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!slug) throw new Error('Unable to read the admin route slug.');

const target = await fetch(`${cdpUrl}/json/new?${encodeURIComponent(`${baseUrl}/${slug}`)}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(String(event.data));
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (expression, label, timeout = 15_000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${label}.`);
};
const navigate = async (url) => {
  await send('Page.navigate', { url });
  await waitFor(`document.readyState === 'complete'`, url);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await navigate(`${baseUrl}/${slug}`);
  const login = await evaluate(`fetch(${JSON.stringify(`${baseUrl}/api/${slug}/login`)}, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(${JSON.stringify({ username, password })}) }).then(async r => ({ status: r.status, body: await r.json() }))`);
  assert(login.status === 200 || login.status === 429, `Admin login failed with ${login.status}.`);
  const token = await new SignJWT({ username }).setProtectedHeader({ alg: 'HS256' }).setSubject(adminId).setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(secret));
  await send('Network.enable');
  const cookie = await send('Network.setCookie', { name: 'lahab_admin_token', value: token, url: baseUrl, path: '/', httpOnly: true, secure: false, sameSite: 'Strict' });
  assert(cookie.success, 'Unable to install the local QA admin session cookie.');
  await navigate(`${baseUrl}/${slug}`);
  await waitFor(`document.body.innerText.toLowerCase().includes('pieces') && document.body.innerText.toLowerCase().includes('site editor')`, 'admin dashboard');
  const tabsPresent = await evaluate(`['pieces','analytics & demand','reviews','orders & inbox','site editor'].every(label => document.body.innerText.toLowerCase().includes(label))`);
  assert(tabsPresent, 'An existing admin workspace is missing.');
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.toLowerCase().includes('site editor'))?.click()`);
  await waitFor(`document.querySelector('iframe[title="Draft storefront preview"]')?.contentDocument?.querySelectorAll('[data-editor-section-id]').length === 13`, 'draft PageRenderer preview');
  const editor = await evaluate(`(() => {
    const frame = document.querySelector('iframe[title="Draft storefront preview"]');
    const doc = frame.contentDocument;
    const submit = doc.querySelector('form');
    const submitBlocked = submit ? !submit.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) : true;
    const toolbarButtons = ['desktop preview','tablet preview','mobile preview','Undo','Redo'].map(label => [label, !!document.querySelector('button[aria-label="' + label + '"]')]);
    const toolbarText = ['en','ar','save draft','publish'].map(label => [label, document.body.innerText.toLowerCase().includes(label)]);
    return {
      safeMarker: !!doc.querySelector('[data-editor-preview-safe="true"]'),
      sections: doc.querySelectorAll('[data-editor-section-id]').length,
      submitBlocked,
      toolbarButtons,
      toolbarText,
      toolbar: toolbarButtons.every(([, present]) => present) && toolbarText.every(([, present]) => present),
    };
  })()`);
  assert(editor.safeMarker && editor.sections === 13 && editor.submitBlocked && editor.toolbar, `Site Editor preview safety or toolbar smoke check failed: ${JSON.stringify(editor)}`);
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase() === 'assets')?.click()`);
  await waitFor(`document.querySelector('[role="dialog"][aria-label="Asset library"]') !== null`, 'asset library');
  await waitFor(`document.querySelectorAll('[role="dialog"][aria-label="Asset library"] article').length >= 3`, 'asset library records');
  await waitFor(`[...document.querySelectorAll('[role="dialog"][aria-label="Asset library"] img')].every(img => img.complete && img.naturalWidth > 0)`, 'Asset Library image resolution');
  await evaluate(`document.querySelector('[role="dialog"][aria-label="Asset library"] button[aria-label="Close asset library"]')?.click()`);
  await waitFor(`document.querySelector('[role="dialog"][aria-label="Asset library"]') === null`, 'asset library close');
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'AR')?.click()`);
  await waitFor(`document.querySelector('iframe[title="Draft storefront preview"]')?.contentDocument?.documentElement.dir === 'rtl'`, 'Arabic RTL preview');
  await evaluate(`document.querySelector('button[aria-label="mobile preview"]')?.click()`);
  await sleep(250);
  const mobileWidth = await evaluate(`document.querySelector('iframe[title="Draft storefront preview"]').parentElement.style.width`);
  assert(mobileWidth === '390px', `Mobile preview width must be 390px, received ${mobileWidth}.`);
  await evaluate(`document.querySelector('iframe[title="Draft storefront preview"]').contentDocument.querySelector('[data-editor-section-id]')?.click()`);
  await sleep(150);
  assert(await evaluate(`document.querySelector('aside[aria-label="Properties inspector"]')?.innerText.toUpperCase().includes('HERO')`), 'Preview-to-inspector selection did not synchronize.');
  await evaluate(`document.querySelector('button[aria-label="Duplicate section"]')?.click()`);
  await waitFor(`document.querySelector('iframe[title="Draft storefront preview"]')?.contentDocument?.querySelectorAll('[data-editor-section-id]').length === 14`, 'unsaved local duplicate');
  const competingSave = await evaluate(`fetch('/api/${slug}/pages/home/draft', { credentials: 'include' }).then(r => r.json()).then(draft => fetch('/api/${slug}/pages/home/draft', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: draft.page, expectedDraftRevisionId: draft.revisionId }) })).then(async r => ({ status: r.status, body: await r.json() }))`);
  assert(competingSave.status === 200, `Competing editor setup failed with ${competingSave.status}.`);
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.toLowerCase().includes('save draft'))?.click()`);
  await waitFor(`document.querySelector('[data-editor-status="conflict"]') !== null`, 'editor conflict state');
  assert(await evaluate(`document.querySelector('iframe[title="Draft storefront preview"]')?.contentDocument?.querySelectorAll('[data-editor-section-id]').length === 14`), 'Conflict must retain unsaved local changes.');
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.toLowerCase().includes('reload latest draft'))?.click()`);
  await waitFor(`document.querySelector('[data-editor-status="saved"]') !== null && document.querySelector('iframe[title="Draft storefront preview"]')?.contentDocument?.querySelectorAll('[data-editor-section-id]').length === 13`, 'conflict reload recovery');

  await navigate(baseUrl);
  await waitFor(`document.querySelectorAll('[data-page-section-id]').length === 13 || document.querySelectorAll('[data-editor-section-id]').length === 13`, 'published homepage sections');
  const storefront = await evaluate(`(() => ({
    renderer: document.querySelector('main')?.dataset.pageRenderer || document.querySelector('[data-page-renderer]')?.getAttribute('data-page-renderer') || null,
    sections: document.querySelectorAll('[data-page-section-id], [data-editor-section-id]').length,
    hasProducts: document.body.innerText.includes('LAHAB HEAVYWEIGHT HOODIE'),
    hasViewer: !!document.querySelector('canvas'),
    failedImages: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => ({ src: img.currentSrc || img.src, alt: img.alt })),
  }))()`);
  assert(storefront.sections === 13 && storefront.hasProducts && storefront.hasViewer && storefront.failedImages.length === 0, `Storefront smoke check failed: ${JSON.stringify(storefront)}`);
  await evaluate(`document.querySelector('#lang-translation-button')?.click()`);
  await waitFor(`document.documentElement.dir === 'rtl' && document.documentElement.lang === 'ar'`, 'public Arabic RTL mode');
  await evaluate(`document.querySelector('#lang-translation-button')?.click()`);
  await waitFor(`document.documentElement.dir === 'ltr' && document.documentElement.lang === 'en'`, 'public English mode');

  await send('Network.setBlockedURLs', { urls: ['*://127.0.0.1:5173/api/pages/home*'] });
  await navigate(`${baseUrl}/?qa-page-api-failure=1`);
  await waitFor(`document.body.innerText.includes('STREETWEAR FORGED IN HERITAGE') && document.body.innerText.includes('LAHAB HEAVYWEIGHT HOODIE')`, 'legacy storefront fallback');
  assert(!(await evaluate(`!!document.querySelector('[data-page-renderer="published"]')`)), 'Page API failure must use the legacy storefront fallback.');
  await send('Network.setBlockedURLs', { urls: [] });
  console.log(`PASS: admin workspaces, Site Editor draft preview/safety/RTL/mobile/selection/conflict, storefront 13-section/product/image/3D/EN/AR, and page-API fallback checks.`);
} finally {
  socket.close();
  await fetch(`${cdpUrl}/json/close/${target.id}`).catch(() => undefined);
}
