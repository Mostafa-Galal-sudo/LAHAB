import type { AssetReference } from '../../shared/pageSchema';
import watercolorHeroArt from '../assets/images/watercolor_hero_art_1788904793593.jpg';
import streetwearEditorial from '../assets/images/streetwear_editorial_1788904807341.jpg';

const BUNDLED_ASSETS: Readonly<Record<string, string>> = {
  'asset-hero-watercolor': watercolorHeroArt,
  'asset-editorial-streetwear': streetwearEditorial,
  'asset-model-hoodie-obj': '/assets/models/lahab_drop01_hoodie.obj',
};

/** Stable IDs resolve to bundled compatibility assets or the public R2 proxy. */
export function resolveAsset(reference: AssetReference | undefined, fallback: string): string {
  if (!reference) return fallback;
  const resolved = BUNDLED_ASSETS[reference.assetId];
  if (resolved && !/^data:/i.test(resolved)) return resolved;
  if (!reference.assetId || /^data:/i.test(reference.assetId)) return fallback;
  return `/api/assets/${encodeURIComponent(reference.assetId)}/content`;
}
