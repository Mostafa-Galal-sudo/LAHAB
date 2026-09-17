import type { Language } from '../translations';
import type { PageDocument } from '../../shared/pageSchema';

export type EditorViewport = 'desktop' | 'tablet' | 'mobile';

export type EditorToPreviewMessage =
  | { type: 'lahab:preview-document'; page: PageDocument; language: Language; selectedSectionId?: string }
  | { type: 'lahab:preview-scroll'; sectionId: string };

export type PreviewToEditorMessage =
  | { type: 'lahab:preview-ready' }
  | { type: 'lahab:preview-select'; sectionId: string; path: string };

export const isEditorMessage = (value: unknown): value is EditorToPreviewMessage =>
  typeof value === 'object' && value !== null && 'type' in value &&
  ['lahab:preview-document', 'lahab:preview-scroll'].includes(String((value as { type?: unknown }).type));
