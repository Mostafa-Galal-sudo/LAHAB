import { PAGE_SECTION_TEMPLATES } from '../../shared/homepageSeed';
import type { PageDocument, PageSection, PageSectionType } from '../../shared/pageSchema';

export type EditorPath = Array<string | number>;

export const deepClone = <T,>(value: T): T => structuredClone(value);

const idPart = () => crypto.randomUUID().replace(/-/g, '').slice(0, 10);

export function regenerateIds<T>(value: T): T {
  const clone = deepClone(value);
  const visit = (current: unknown) => {
    if (Array.isArray(current)) return current.forEach(visit);
    if (!current || typeof current !== 'object') return;
    const object = current as Record<string, unknown>;
    if (typeof object.id === 'string') object.id = `${object.id.split('-').slice(0, 2).join('-')}-${idPart()}`;
    Object.values(object).forEach(visit);
  };
  visit(clone);
  return clone;
}

export function createSection(type: PageSectionType): PageSection {
  const template = PAGE_SECTION_TEMPLATES.find((section) => section.type === type);
  if (!template) throw new Error(`No section template registered for ${type}`);
  return regenerateIds(template);
}

export function setAtPath(document: PageDocument, path: EditorPath, value: unknown): PageDocument {
  const next = deepClone(document);
  let cursor: unknown = next;
  path.slice(0, -1).forEach((part) => {
    cursor = (cursor as Record<string | number, unknown>)[part];
  });
  (cursor as Record<string | number, unknown>)[path[path.length - 1]] = value;
  return next;
}

export function getAtPath(root: unknown, path: EditorPath): unknown {
  return path.reduce<unknown>((value, part) => (value as Record<string | number, unknown>)?.[part], root);
}

export function moveInArray<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

export interface EditableLeaf {
  path: EditorPath;
  label: string;
  value: string | number | boolean;
}

export function collectEditableLeaves(value: unknown, base: EditorPath = []): EditableLeaf[] {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [{ path: base, label: base.map(String).join(' / '), value }];
  }
  if (Array.isArray(value)) return value.flatMap((item, index) => collectEditableLeaves(item, [...base, index]));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([key]) => key !== 'id' && key !== 'type')
    .flatMap(([key, child]) => collectEditableLeaves(child, [...base, key]));
}

export function nestedArrays(section: PageSection): Array<{ key: string; items: unknown[] }> {
  return Object.entries(section.content)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, items]) => ({ key, items: items as unknown[] }))
    .filter(({ key }) => !['materialTags', 'demoSerials'].includes(key));
}
