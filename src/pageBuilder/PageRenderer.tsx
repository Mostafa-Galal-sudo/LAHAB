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
        <div
          key={section.id}
          data-editor-section-id={section.id}
          data-editor-path={`sections.${page.sections.indexOf(section)}`}
          style={{ display: 'contents' }}
          onClickCapture={context.editorPreview ? (event) => {
            event.preventDefault();
            event.stopPropagation();
            context.editorPreview!.onSelectSection(section.id, `sections.${page.sections.indexOf(section)}`);
          } : undefined}
        >
          <SectionRenderer section={section} context={context} />
        </div>
      ))}
    </div>
  );
};

export default PageRenderer;
