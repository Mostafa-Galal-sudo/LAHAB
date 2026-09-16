import React from 'react';
import type { PageDocument } from '../../shared/pageSchema';
import type { StorefrontContext } from './StorefrontContext';
import { getRenderableSections } from './pageRuntime';
import { SectionRenderer } from './sectionRegistry';

interface PageRendererProps {
  page: PageDocument;
  context: StorefrontContext;
}

const PageRenderer: React.FC<PageRendererProps> = ({ page, context }) => {
  const sections = getRenderableSections(page);

  return (
    <div
      data-page-renderer="published"
      data-page-section-count={sections.length}
      style={{ display: 'contents' }}
    >
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} context={context} />
      ))}
    </div>
  );
};

export default PageRenderer;
