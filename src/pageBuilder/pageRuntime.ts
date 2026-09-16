import type { PageDocument, PageSection } from '../../shared/pageSchema';

/** Array position is canonical; no secondary sorting is performed. */
export function getRenderableSections(page: PageDocument): PageSection[] {
  return page.sections.filter((section) => section.visible);
}

