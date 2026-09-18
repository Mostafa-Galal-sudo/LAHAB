-- Streamline the homepage while preserving the immutable revision history.
-- The public and draft documents each inherit their current content, remove
-- three retired sections, and move Drop 01 directly after the brand concept.

INSERT OR IGNORE INTO page_revisions (
  id,
  page_id,
  schema_version,
  document_json,
  created_by,
  created_at,
  published_at
)
SELECT
  'homepage-streamlined-published-v1',
  p.id,
  r.schema_version,
  json_set(
    r.document_json,
    '$.sections',
    json(COALESCE((
      SELECT json_group_array(json(section_json))
      FROM (
        SELECT
          section.value AS section_json,
          CASE
            WHEN json_extract(section.value, '$.id') = 'home-products' THEN
              COALESCE((
                SELECT CAST(brand.key AS INTEGER) * 2 + 1
                FROM json_each(r.document_json, '$.sections') AS brand
                WHERE json_extract(brand.value, '$.id') = 'home-brand-story'
                LIMIT 1
              ), CAST(section.key AS INTEGER) * 2)
            ELSE CAST(section.key AS INTEGER) * 2
          END AS desired_order
        FROM json_each(r.document_json, '$.sections') AS section
        WHERE json_extract(section.value, '$.id') NOT IN (
          'home-calligraphic-banner',
          'home-editorial',
          'home-archival-vault'
        )
        ORDER BY desired_order
      )
    ), '[]'))
  ),
  NULL,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM pages AS p
JOIN page_revisions AS r ON r.id = p.published_revision_id
WHERE p.id = 'homepage';

-- Preserve an independently edited draft instead of silently replacing it.
INSERT OR IGNORE INTO page_revisions (
  id,
  page_id,
  schema_version,
  document_json,
  created_by,
  created_at,
  published_at
)
SELECT
  'homepage-streamlined-draft-v1',
  p.id,
  r.schema_version,
  json_set(
    r.document_json,
    '$.sections',
    json(COALESCE((
      SELECT json_group_array(json(section_json))
      FROM (
        SELECT
          section.value AS section_json,
          CASE
            WHEN json_extract(section.value, '$.id') = 'home-products' THEN
              COALESCE((
                SELECT CAST(brand.key AS INTEGER) * 2 + 1
                FROM json_each(r.document_json, '$.sections') AS brand
                WHERE json_extract(brand.value, '$.id') = 'home-brand-story'
                LIMIT 1
              ), CAST(section.key AS INTEGER) * 2)
            ELSE CAST(section.key AS INTEGER) * 2
          END AS desired_order
        FROM json_each(r.document_json, '$.sections') AS section
        WHERE json_extract(section.value, '$.id') NOT IN (
          'home-calligraphic-banner',
          'home-editorial',
          'home-archival-vault'
        )
        ORDER BY desired_order
      )
    ), '[]'))
  ),
  NULL,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  NULL
FROM pages AS p
JOIN page_revisions AS r ON r.id = p.draft_revision_id
WHERE p.id = 'homepage'
  AND p.draft_revision_id IS NOT p.published_revision_id;

UPDATE pages
SET
  draft_revision_id = CASE
    WHEN draft_revision_id IS published_revision_id
      THEN 'homepage-streamlined-published-v1'
    ELSE 'homepage-streamlined-draft-v1'
  END,
  published_revision_id = 'homepage-streamlined-published-v1',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'homepage'
  AND EXISTS (
    SELECT 1
    FROM page_revisions
    WHERE id = 'homepage-streamlined-published-v1'
      AND page_id = 'homepage'
  );
