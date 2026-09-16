import {
  PAGE_SCHEMA_VERSION,
  type PageDocument,
  type PageSectionType,
} from './pageSchema';

export interface PageDocumentValidationResult {
  valid: boolean;
  errors: string[];
}

const SECTION_TYPES: PageSectionType[] = [
  'hero',
  'calligraphicBanner',
  'brandStory',
  'editorialLookbook',
  'productShowcase',
  'garmentViewer',
  'productReviews',
  'streetStyleLookbook',
  'serialVerifier',
  'archivalVault',
  'faq',
  'contact',
  'footer',
];

const THEME_COLORS = ['primary', 'surface', 'surfaceElevated', 'accent', 'accentMuted', 'text', 'textMuted', 'transparent'];
const SPACING = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
const WIDTHS = ['narrow', 'standard', 'wide', 'full'];
const ALIGNMENTS = ['start', 'center', 'end'];
const FAMILIES = ['heading', 'body', 'mono'];
const SCALES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'display'];
const WEIGHTS = ['normal', 'medium', 'semibold', 'bold', 'black'];
const ITEM_ID = /^[a-z][a-z0-9-]{2,63}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkKeys(value: JsonObject, allowed: string[], required: string[], path: string, errors: string[]) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${path}.${key} is not supported`);
  }
  for (const key of required) {
    if (!(key in value)) errors.push(`${path}.${key} is required`);
  }
}

function checkString(value: unknown, path: string, errors: string[], allowEmpty = false): value is string {
  if (typeof value !== 'string' || (!allowEmpty && value.trim().length === 0) || value.length > 10_000) {
    errors.push(`${path} must be ${allowEmpty ? 'a string' : 'a non-empty string'}`);
    return false;
  }
  if (/^data:/i.test(value.trim())) errors.push(`${path} must not contain base64/data-URI media`);
  return true;
}

function checkBoolean(value: unknown, path: string, errors: string[]): value is boolean {
  if (typeof value !== 'boolean') {
    errors.push(`${path} must be a boolean`);
    return false;
  }
  return true;
}

function checkNumber(value: unknown, path: string, errors: string[], min: number, max: number): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    errors.push(`${path} must be a finite number between ${min} and ${max}`);
    return false;
  }
  return true;
}

function checkEnum(value: unknown, allowed: readonly string[], path: string, errors: string[]): value is string {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    errors.push(`${path} must be one of: ${allowed.join(', ')}`);
    return false;
  }
  return true;
}

function checkId(value: unknown, path: string, errors: string[]): value is string {
  if (typeof value !== 'string' || !ITEM_ID.test(value)) {
    errors.push(`${path} must be a stable kebab-case identifier`);
    return false;
  }
  return true;
}

function checkLocalized(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object with en and ar strings`);
    return;
  }
  checkKeys(value, ['en', 'ar'], ['en', 'ar'], path, errors);
  checkString(value.en, `${path}.en`, errors, true);
  checkString(value.ar, `${path}.ar`, errors, true);
}

function checkAsset(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be an asset reference`);
    return;
  }
  checkKeys(value, ['assetId'], ['assetId'], path, errors);
  checkId(value.assetId, `${path}.assetId`, errors);
}

function checkHex(value: unknown, path: string, errors: string[]) {
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) errors.push(`${path} must be a six-digit hex color`);
}

function checkColor(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be a typed color`);
    return;
  }
  if (value.kind === 'theme') {
    checkKeys(value, ['kind', 'token'], ['kind', 'token'], path, errors);
    checkEnum(value.token, THEME_COLORS, `${path}.token`, errors);
  } else if (value.kind === 'hex') {
    checkKeys(value, ['kind', 'value'], ['kind', 'value'], path, errors);
    checkHex(value.value, `${path}.value`, errors);
  } else {
    errors.push(`${path}.kind must be theme or hex`);
  }
}

function checkBackground(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be a typed background`);
    return;
  }
  if (value.kind === 'theme') {
    checkKeys(value, ['kind', 'token'], ['kind', 'token'], path, errors);
    checkEnum(value.token, THEME_COLORS, `${path}.token`, errors);
    return;
  }
  if (value.kind === 'solid') {
    checkKeys(value, ['kind', 'color'], ['kind', 'color'], path, errors);
    checkColor(value.color, `${path}.color`, errors);
    return;
  }
  if (value.kind === 'image') {
    checkKeys(value, ['kind', 'asset', 'position', 'fit', 'overlay', 'overlayOpacity'], ['kind', 'asset', 'position', 'fit'], path, errors);
    checkAsset(value.asset, `${path}.asset`, errors);
    checkEnum(value.position, ['center', 'top', 'bottom', 'left', 'right'], `${path}.position`, errors);
    checkEnum(value.fit, ['cover', 'contain'], `${path}.fit`, errors);
    if (value.overlay !== undefined) checkColor(value.overlay, `${path}.overlay`, errors);
    if (value.overlayOpacity !== undefined) checkNumber(value.overlayOpacity, `${path}.overlayOpacity`, errors, 0, 1);
    return;
  }
  errors.push(`${path}.kind must be theme, solid, or image`);
}

function checkStyle(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  const required = ['background', 'paddingTop', 'paddingBottom', 'contentWidth', 'textAlign'];
  checkKeys(value, [...required, 'textColor', 'accentColor', 'headingFamily', 'headingScale', 'headingWeight'], required, path, errors);
  checkBackground(value.background, `${path}.background`, errors);
  checkEnum(value.paddingTop, SPACING, `${path}.paddingTop`, errors);
  checkEnum(value.paddingBottom, SPACING, `${path}.paddingBottom`, errors);
  checkEnum(value.contentWidth, WIDTHS, `${path}.contentWidth`, errors);
  checkEnum(value.textAlign, ALIGNMENTS, `${path}.textAlign`, errors);
  if (value.textColor !== undefined) checkColor(value.textColor, `${path}.textColor`, errors);
  if (value.accentColor !== undefined) checkColor(value.accentColor, `${path}.accentColor`, errors);
  if (value.headingFamily !== undefined) checkEnum(value.headingFamily, FAMILIES, `${path}.headingFamily`, errors);
  if (value.headingScale !== undefined) checkEnum(value.headingScale, SCALES, `${path}.headingScale`, errors);
  if (value.headingWeight !== undefined) checkEnum(value.headingWeight, WEIGHTS, `${path}.headingWeight`, errors);
}

function checkResponsive(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  checkKeys(value, ['mobile', 'tablet'], [], path, errors);
  for (const breakpoint of ['mobile', 'tablet'] as const) {
    const config = value[breakpoint];
    if (config === undefined) continue;
    if (!isObject(config)) {
      errors.push(`${path}.${breakpoint} must be an object`);
      continue;
    }
    checkKeys(config, ['paddingTop', 'paddingBottom', 'textAlign'], [], `${path}.${breakpoint}`, errors);
    if (config.paddingTop !== undefined) checkEnum(config.paddingTop, SPACING, `${path}.${breakpoint}.paddingTop`, errors);
    if (config.paddingBottom !== undefined) checkEnum(config.paddingBottom, SPACING, `${path}.${breakpoint}.paddingBottom`, errors);
    if (config.textAlign !== undefined) checkEnum(config.textAlign, ALIGNMENTS, `${path}.${breakpoint}.textAlign`, errors);
  }
}

function checkAction(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be an action object`);
    return;
  }
  if (value.type === 'scrollToSection') {
    checkKeys(value, ['type', 'sectionId'], ['type', 'sectionId'], path, errors);
    checkId(value.sectionId, `${path}.sectionId`, errors);
  } else if (value.type === 'link') {
    checkKeys(value, ['type', 'href', 'target'], ['type', 'href', 'target'], path, errors);
    if (checkString(value.href, `${path}.href`, errors) && /^(javascript|data):/i.test(value.href.trim())) {
      errors.push(`${path}.href uses a forbidden URL scheme`);
    }
    checkEnum(value.target, ['self', 'blank'], `${path}.target`, errors);
  } else if (value.type === 'openSizeGuide') {
    checkKeys(value, ['type'], ['type'], path, errors);
  } else {
    errors.push(`${path}.type is not a supported action`);
  }
}

function checkActionItem(value: unknown, path: string, errors: string[]) {
  if (!isObject(value)) {
    errors.push(`${path} must be an action item`);
    return;
  }
  checkKeys(value, ['id', 'label', 'action', 'variant'], ['id', 'label', 'action', 'variant'], path, errors);
  checkId(value.id, `${path}.id`, errors);
  checkLocalized(value.label, `${path}.label`, errors);
  checkAction(value.action, `${path}.action`, errors);
  checkEnum(value.variant, ['primary', 'secondary', 'text'], `${path}.variant`, errors);
}

function checkArray(value: unknown, path: string, errors: string[], itemCheck: (item: unknown, itemPath: string, errors: string[]) => void) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }
  value.forEach((item, index) => itemCheck(item, `${path}[${index}]`, errors));
}

function checkLocalizedFields(content: JsonObject, fields: string[], path: string, errors: string[]) {
  fields.forEach((field) => checkLocalized(content[field], `${path}.${field}`, errors));
}

function checkBaseSection(section: JsonObject, path: string, errors: string[]) {
  checkId(section.id, `${path}.id`, errors);
  checkBoolean(section.visible, `${path}.visible`, errors);
  checkStyle(section.style, `${path}.style`, errors);
  if (section.responsive !== undefined) checkResponsive(section.responsive, `${path}.responsive`, errors);
}

function checkContentObject(value: unknown, allowed: string[], required: string[], path: string, errors: string[]): JsonObject | null {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return null;
  }
  checkKeys(value, allowed, required, path, errors);
  return value;
}

function checkSection(section: unknown, path: string, errors: string[]) {
  if (!isObject(section)) {
    errors.push(`${path} must be an object`);
    return;
  }
  const baseKeys = ['id', 'type', 'visible', 'content', 'style', 'responsive'];
  checkKeys(section, baseKeys, ['id', 'type', 'visible', 'content', 'style'], path, errors);
  checkBaseSection(section, path, errors);
  if (!checkEnum(section.type, SECTION_TYPES, `${path}.type`, errors)) return;
  const contentPath = `${path}.content`;

  switch (section.type) {
    case 'hero': {
      const fields = ['badge', 'tagline', 'subTagline', 'aestheticTag', 'fabricTag', 'editionLabel', 'editionValue', 'shippingLabel', 'shippingValue', 'scrollPrompt', 'backgroundImage', 'actions'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, fields.slice(0, 10), contentPath, errors);
      checkAsset(content.backgroundImage, `${contentPath}.backgroundImage`, errors);
      checkArray(content.actions, `${contentPath}.actions`, errors, checkActionItem);
      break;
    }
    case 'calligraphicBanner': {
      const content = checkContentObject(section.content, ['items', 'showWordmark'], ['items', 'showWordmark'], contentPath, errors);
      if (!content) break;
      checkBoolean(content.showWordmark, `${contentPath}.showWordmark`, errors);
      checkArray(content.items, `${contentPath}.items`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'text', 'emphasis'], ['id', 'text', 'emphasis'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkLocalized(obj.text, `${itemPath}.text`, itemErrors);
        checkEnum(obj.emphasis, ['normal', 'accent', 'muted'], `${itemPath}.emphasis`, itemErrors);
      });
      break;
    }
    case 'brandStory': {
      const fields = ['badge', 'headline', 'body', 'bodyMobile', 'visualLabel', 'materialTags', 'features'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, fields.slice(0, 5), contentPath, errors);
      checkArray(content.materialTags, `${contentPath}.materialTags`, errors, checkLocalized);
      checkArray(content.features, `${contentPath}.features`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'title', 'description'], ['id', 'title', 'description'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkLocalized(obj.title, `${itemPath}.title`, itemErrors);
        checkLocalized(obj.description, `${itemPath}.description`, itemErrors);
      });
      break;
    }
    case 'editorialLookbook': {
      const fields = ['badge', 'title', 'subtitle', 'cards'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, fields.slice(0, 3), contentPath, errors);
      checkArray(content.cards, `${contentPath}.cards`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'title', 'description', 'image', 'action'], ['id', 'title', 'description', 'image'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkLocalized(obj.title, `${itemPath}.title`, itemErrors);
        checkLocalized(obj.description, `${itemPath}.description`, itemErrors);
        checkAsset(obj.image, `${itemPath}.image`, itemErrors);
        if (obj.action !== undefined) checkActionItem(obj.action, `${itemPath}.action`, itemErrors);
      });
      break;
    }
    case 'productShowcase': {
      const fields = ['badge', 'title', 'limitedUnits', 'assuranceTitle', 'assuranceDescription', 'source'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, fields.slice(0, 5), contentPath, errors);
      const source = checkContentObject(content.source, ['kind', 'productIds'], ['kind'], `${contentPath}.source`, errors);
      if (source) {
        if (source.kind === 'allProducts') checkKeys(source, ['kind'], ['kind'], `${contentPath}.source`, errors);
        else if (source.kind === 'selectedProducts') checkArray(source.productIds, `${contentPath}.source.productIds`, errors, checkString);
        else errors.push(`${contentPath}.source.kind is unsupported`);
      }
      break;
    }
    case 'garmentViewer': {
      const fields = ['badge', 'title', 'description', 'productSource', 'model', 'allowManualOrbit', 'showFallbackMannequin'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, ['badge', 'title', 'description'], contentPath, errors);
      const source = checkContentObject(content.productSource, ['kind', 'productId'], ['kind'], `${contentPath}.productSource`, errors);
      if (source) {
        if (source.kind === 'firstAvailableProduct') checkKeys(source, ['kind'], ['kind'], `${contentPath}.productSource`, errors);
        else if (source.kind === 'product') checkString(source.productId, `${contentPath}.productSource.productId`, errors);
        else errors.push(`${contentPath}.productSource.kind is unsupported`);
      }
      const modelFields = ['assetId', 'format', 'scale', 'position', 'rotation', 'cameraPosition', 'autoRotate', 'autoRotateSpeed', 'backgroundColor', 'lightingPreset', 'materialColor'];
      const model = checkContentObject(content.model, modelFields, modelFields.slice(0, 10), `${contentPath}.model`, errors);
      if (model) {
        checkId(model.assetId, `${contentPath}.model.assetId`, errors);
        checkEnum(model.format, ['obj', 'glb'], `${contentPath}.model.format`, errors);
        for (const field of ['scale', 'position', 'rotation', 'cameraPosition']) {
          const vector = model[field];
          if (!Array.isArray(vector) || vector.length !== 3) errors.push(`${contentPath}.model.${field} must contain exactly three numbers`);
          else vector.forEach((number, index) => checkNumber(number, `${contentPath}.model.${field}[${index}]`, errors, -10000, 10000));
        }
        checkBoolean(model.autoRotate, `${contentPath}.model.autoRotate`, errors);
        checkNumber(model.autoRotateSpeed, `${contentPath}.model.autoRotateSpeed`, errors, -100, 100);
        checkHex(model.backgroundColor, `${contentPath}.model.backgroundColor`, errors);
        checkEnum(model.lightingPreset, ['studio', 'softbox', 'dramatic', 'neutral'], `${contentPath}.model.lightingPreset`, errors);
        if (model.materialColor !== undefined) checkHex(model.materialColor, `${contentPath}.model.materialColor`, errors);
      }
      checkBoolean(content.allowManualOrbit, `${contentPath}.allowManualOrbit`, errors);
      checkBoolean(content.showFallbackMannequin, `${contentPath}.showFallbackMannequin`, errors);
      break;
    }
    case 'productReviews': {
      const fields = ['badge', 'title', 'description', 'source', 'allowSubmissions', 'showFilters'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, ['badge', 'title', 'description'], contentPath, errors);
      const source = checkContentObject(content.source, ['kind', 'productId'], ['kind'], `${contentPath}.source`, errors);
      if (source) {
        if (source.kind === 'allProductReviews') checkKeys(source, ['kind'], ['kind'], `${contentPath}.source`, errors);
        else if (source.kind === 'productReviews') checkString(source.productId, `${contentPath}.source.productId`, errors);
        else errors.push(`${contentPath}.source.kind is unsupported`);
      }
      checkBoolean(content.allowSubmissions, `${contentPath}.allowSubmissions`, errors);
      checkBoolean(content.showFilters, `${contentPath}.showFilters`, errors);
      break;
    }
    case 'streetStyleLookbook': {
      const content = checkContentObject(section.content, ['badge', 'title', 'items'], ['badge', 'title', 'items'], contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, ['badge', 'title'], contentPath, errors);
      checkArray(content.items, `${contentPath}.items`, errors, (item, itemPath, itemErrors) => {
        const fields = ['id', 'image', 'location', 'modelName', 'productName', 'stylingNotes', 'sizeWorn', 'productId', 'region', 'visible'];
        const obj = checkContentObject(item, fields, fields.filter((field) => field !== 'productId'), itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkAsset(obj.image, `${itemPath}.image`, itemErrors);
        checkLocalizedFields(obj, ['location', 'modelName', 'productName', 'stylingNotes'], itemPath, itemErrors);
        checkString(obj.sizeWorn, `${itemPath}.sizeWorn`, itemErrors);
        if (obj.productId !== undefined) checkString(obj.productId, `${itemPath}.productId`, itemErrors);
        checkEnum(obj.region, ['cairo', 'dubai', 'london', 'other'], `${itemPath}.region`, itemErrors);
        checkBoolean(obj.visible, `${itemPath}.visible`, itemErrors);
      });
      break;
    }
    case 'serialVerifier': {
      const fields = ['badge', 'title', 'description', 'inputLabel', 'submitLabel', 'demoSerials'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, fields.slice(0, 5), contentPath, errors);
      checkArray(content.demoSerials, `${contentPath}.demoSerials`, errors, checkString);
      break;
    }
    case 'archivalVault': {
      const fields = ['badge', 'title', 'description', 'countdownTarget', 'pieces', 'allowPasscode', 'allowWaitlist'];
      const content = checkContentObject(section.content, fields, fields.filter((field) => field !== 'countdownTarget'), contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, ['badge', 'title', 'description'], contentPath, errors);
      if (content.countdownTarget !== undefined && checkString(content.countdownTarget, `${contentPath}.countdownTarget`, errors) && Number.isNaN(Date.parse(content.countdownTarget))) {
        errors.push(`${contentPath}.countdownTarget must be an ISO date string`);
      }
      checkArray(content.pieces, `${contentPath}.pieces`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'name', 'details', 'status', 'visible'], ['id', 'name', 'details', 'status', 'visible'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkLocalizedFields(obj, ['name', 'details', 'status'], itemPath, itemErrors);
        checkBoolean(obj.visible, `${itemPath}.visible`, itemErrors);
      });
      checkBoolean(content.allowPasscode, `${contentPath}.allowPasscode`, errors);
      checkBoolean(content.allowWaitlist, `${contentPath}.allowWaitlist`, errors);
      break;
    }
    case 'faq': {
      const content = checkContentObject(section.content, ['badge', 'title', 'subtitle', 'items'], ['badge', 'title', 'subtitle', 'items'], contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, ['badge', 'title', 'subtitle'], contentPath, errors);
      checkArray(content.items, `${contentPath}.items`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'category', 'question', 'answer', 'visible'], ['id', 'category', 'question', 'answer', 'visible'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkLocalizedFields(obj, ['category', 'question', 'answer'], itemPath, itemErrors);
        checkBoolean(obj.visible, `${itemPath}.visible`, itemErrors);
      });
      break;
    }
    case 'contact': {
      const fields = ['badge', 'title', 'description', 'email', 'phoneDisplay', 'whatsappNumber', 'responseTime', 'inquiryCategories'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, ['badge', 'title', 'description', 'responseTime'], contentPath, errors);
      ['email', 'phoneDisplay', 'whatsappNumber'].forEach((field) => checkString(content[field], `${contentPath}.${field}`, errors));
      checkArray(content.inquiryCategories, `${contentPath}.inquiryCategories`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'value', 'label'], ['id', 'value', 'label'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkString(obj.value, `${itemPath}.value`, itemErrors);
        checkLocalized(obj.label, `${itemPath}.label`, itemErrors);
      });
      break;
    }
    case 'footer': {
      const fields = ['brandDescription', 'navigationHeading', 'links', 'notificationHeading', 'notificationDescription', 'emailPlaceholder', 'joinLabel', 'joinedMessage', 'communityHeading', 'copyright', 'edition'];
      const content = checkContentObject(section.content, fields, fields, contentPath, errors);
      if (!content) break;
      checkLocalizedFields(content, fields.filter((field) => field !== 'links'), contentPath, errors);
      checkArray(content.links, `${contentPath}.links`, errors, (item, itemPath, itemErrors) => {
        const obj = checkContentObject(item, ['id', 'label', 'action'], ['id', 'label', 'action'], itemPath, itemErrors);
        if (!obj) return;
        checkId(obj.id, `${itemPath}.id`, itemErrors);
        checkLocalized(obj.label, `${itemPath}.label`, itemErrors);
        checkAction(obj.action, `${itemPath}.action`, itemErrors);
      });
      break;
    }
  }
}

function checkUniqueStableIds(value: unknown, errors: string[]) {
  const seen = new Map<string, string>();

  const visit = (current: unknown, path: string) => {
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!isObject(current)) return;

    if (typeof current.id === 'string') {
      const previousPath = seen.get(current.id);
      if (previousPath) errors.push(`${path}.id duplicates the stable ID already used at ${previousPath}.id`);
      else seen.set(current.id, path);
    }

    Object.entries(current).forEach(([key, child]) => visit(child, `${path}.${key}`));
  };

  visit(value, 'document');
}

export function validatePageDocument(input: unknown): PageDocumentValidationResult {
  const errors: string[] = [];
  if (!isObject(input)) return { valid: false, errors: ['document must be an object'] };

  checkKeys(input, ['schemaVersion', 'id', 'slug', 'title', 'settings', 'sections'], ['schemaVersion', 'id', 'slug', 'title', 'settings', 'sections'], 'document', errors);

  if (input.schemaVersion !== PAGE_SCHEMA_VERSION) {
    errors.push(`document.schemaVersion must be ${PAGE_SCHEMA_VERSION}; unsupported schema versions are rejected`);
  }
  checkId(input.id, 'document.id', errors);
  checkId(input.slug, 'document.slug', errors);
  checkLocalized(input.title, 'document.title', errors);

  const settings = checkContentObject(input.settings, ['defaultLanguage', 'supportedLanguages', 'defaultTheme'], ['defaultLanguage', 'supportedLanguages', 'defaultTheme'], 'document.settings', errors);
  if (settings) {
    checkEnum(settings.defaultLanguage, ['en', 'ar'], 'document.settings.defaultLanguage', errors);
    if (!Array.isArray(settings.supportedLanguages) || settings.supportedLanguages.length !== 2 || settings.supportedLanguages[0] !== 'en' || settings.supportedLanguages[1] !== 'ar') {
      errors.push('document.settings.supportedLanguages must be exactly ["en", "ar"]');
    }
    checkEnum(settings.defaultTheme, ['navy', 'desert'], 'document.settings.defaultTheme', errors);
  }

  checkArray(input.sections, 'document.sections', errors, checkSection);
  checkUniqueStableIds(input, errors);

  return { valid: errors.length === 0, errors: errors.slice(0, 100) };
}

export class PageDocumentValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(`Invalid PageDocument: ${errors.join('; ')}`);
    this.name = 'PageDocumentValidationError';
    this.errors = errors;
  }
}

export function assertValidPageDocument(input: unknown): asserts input is PageDocument {
  const result = validatePageDocument(input);
  if (!result.valid) throw new PageDocumentValidationError(result.errors);
}
