-- Phase 3-6 compatibility updates. Existing business tables remain untouched.
-- The seeded presentation values mirror the pre-editor Three.js scene.
UPDATE page_revisions
SET document_json = json_set(
  document_json,
  '$.sections[5].content.model.cameraPosition', json('[0,0.4,4.2]'),
  '$.sections[5].content.model.autoRotateSpeed', 1
)
WHERE id = 'homepage-v1' AND page_id = 'homepage';

CREATE INDEX IF NOT EXISTS idx_page_revisions_page_id
  ON page_revisions(page_id, id);
