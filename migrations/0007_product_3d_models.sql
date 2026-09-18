-- Associate each product with its own stable 3D asset and presentation settings.
-- Binary model data remains in R2; D1 stores references/configuration only.
ALTER TABLE products ADD COLUMN modelAssetId TEXT;
ALTER TABLE products ADD COLUMN modelFormat TEXT CHECK (modelFormat IS NULL OR modelFormat IN ('obj', 'glb'));
ALTER TABLE products ADD COLUMN modelConfigJson TEXT;

UPDATE products
SET modelAssetId = 'asset-model-hoodie-obj',
    modelFormat = 'obj',
    modelConfigJson = '{"assetId":"asset-model-hoodie-obj","format":"obj","scale":[1,1,1],"position":[0,0,0],"rotation":[0,0,0],"cameraPosition":[0,0.4,4.2],"autoRotate":true,"autoRotateSpeed":1,"backgroundColor":"#0A1422","lightingPreset":"studio"}'
WHERE id = 'hoodie-01';

CREATE INDEX IF NOT EXISTS idx_products_model_asset_id ON products(modelAssetId);
