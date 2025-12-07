// Anime Card Layout Configuration
// Unity-style anchor/pivot system for precise positioning

// Anchor presets (where the element anchors to in the parent)
export type AnchorPreset = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'stretch-horizontal' | 'stretch-vertical' | 'stretch';

// Pivot point (origin point of the element, 0-1 relative to element size)
export interface PivotPoint {
  x: number; // 0 = left, 0.5 = center, 1 = right
  y: number; // 0 = top, 0.5 = center, 1 = bottom
}

// Unity-style rect transform for each element
export interface RectTransform {
  // Anchor preset (default: top-left)
  anchor: AnchorPreset;
  // Pivot point (origin of the element, default: 0,0)
  pivot: PivotPoint;
  // Position (x, y offset from anchor in relative units 0-1)
  x: number;
  y: number;
  // Size (width and height in relative units 0-1)
  w: number;
  h: number;
  // Z-index for render order (higher = on top)
  zIndex: number;
}

// Stars config (special case with size and gap)
export interface StarsConfig {
  anchor: AnchorPreset;
  pivot: PivotPoint;
  x: number;
  y: number;
  size: number;
  gap: number;
  // Z-index for render order (higher = on top)
  zIndex: number;
}

export interface AnimeCardConfig {
  // Layout frame overlay
  layout: RectTransform;
  // Artwork area (where the card image is clipped)
  artwork: RectTransform;
  // Level stars row
  stars: StarsConfig;
  // Attribute icon
  attribute: RectTransform;
  // ATK box
  atk: RectTransform;
  // DEF box
  def: RectTransform;
  // Font size (relative to height)
  fontSize: number;
}

// Helper to convert anchor preset to actual anchor values (0-1)
export function getAnchorValues(anchor: AnchorPreset): { x: number; y: number } {
  const anchors: Record<AnchorPreset, { x: number; y: number }> = {
    'top-left': { x: 0, y: 0 },
    'top-center': { x: 0.5, y: 0 },
    'top-right': { x: 1, y: 0 },
    'middle-left': { x: 0, y: 0.5 },
    'center': { x: 0.5, y: 0.5 },
    'middle-right': { x: 1, y: 0.5 },
    'bottom-left': { x: 0, y: 1 },
    'bottom-center': { x: 0.5, y: 1 },
    'bottom-right': { x: 1, y: 1 },
    'stretch-horizontal': { x: 0.5, y: 0.5 },
    'stretch-vertical': { x: 0.5, y: 0.5 },
    'stretch': { x: 0.5, y: 0.5 },
  };
  return anchors[anchor];
}

// Calculate actual rect from RectTransform (returns x, y, w, h in pixel space)
export function calculateRect(transform: RectTransform, parentW: number, parentH: number): { x: number; y: number; w: number; h: number } {
  const anchorPos = getAnchorValues(transform.anchor);
  
  // Calculate anchor position in parent space
  const anchorX = anchorPos.x * parentW;
  const anchorY = anchorPos.y * parentH;
  
  // Calculate element size
  const w = transform.w * parentW;
  const h = transform.h * parentH;
  
  // Calculate position with pivot offset
  // Position is offset from anchor, then we subtract pivot * size to get top-left corner
  const x = anchorX + (transform.x * parentW) - (transform.pivot.x * w);
  const y = anchorY + (transform.y * parentH) - (transform.pivot.y * h);
  
  return { x, y, w, h };
}

// Calculate stars rect (special case)
export function calculateStarsRect(stars: StarsConfig, parentW: number, parentH: number, starCount: number): { x: number; y: number; w: number; h: number } {
  const anchorPos = getAnchorValues(stars.anchor);
  
  const anchorX = anchorPos.x * parentW;
  const anchorY = anchorPos.y * parentH;
  
  const starSize = stars.size * parentW;
  const gap = stars.gap * parentW;
  const totalWidth = starCount * starSize + (starCount - 1) * gap;
  const h = starSize;
  
  // Position with pivot offset
  const x = anchorX + (stars.x * parentW) - (stars.pivot.x * totalWidth);
  const y = anchorY + (stars.y * parentH) - (stars.pivot.y * h);
  
  return { x, y, w: totalWidth, h };
}

// Card type for configuration selection
export type CardConfigType = 'monster' | 'spell' | 'trap';

// Monster card configuration (also used as fallback)
export const MONSTER_CARD_CONFIG: AnimeCardConfig = {
  layout: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 1, h: 1, zIndex: 0,
  },
  artwork: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0.022741935483870965, y: 0.01869747899159664,
    w: 0.9574486803519061, h: 0.7075210084033613, zIndex: 10,
  },
  stars: {
    anchor: 'top-center', pivot: { x: 0.5, y: 0 },
    x: 0, y: 0.7675210084033613,
    size: 0.07161344537815126, gap: 0.005, zIndex: 20,
  },
  attribute: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0.8026392961876833, y: 0.746218487394958,
    w: 0.10879765395894428, h: 0.08109243697478992, zIndex: 30,
  },
  atk: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0.08924633431085047, y: 0.8496218487394958,
    w: 0.38, h: 0.12, zIndex: 40,
  },
  def: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0.5549999999999999, y: 0.8538235294117648,
    w: 0.3389442815249267, h: 0.09478991596638654, zIndex: 40,
  },
  fontSize: 0.065,
};

// Spell card configuration (no stars, no ATK/DEF)
export const SPELL_CARD_CONFIG: AnimeCardConfig = {
  layout: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 1, h: 1, zIndex: 0,
  },
  artwork: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0.02274193548387097, y: 0.01869747899159664,
    w: 0.9633137829912024, h: 0.703781512605042, zIndex: 10,
  },
  stars: {
    anchor: 'top-center', pivot: { x: 0.5, y: 0 },
    x: 0, y: 0.85,
    size: 0, gap: 0, zIndex: 20,
  },
  attribute: {
    anchor: 'top-center', pivot: { x: 0.5, y: 0 },
    x: 0, y: 0.8321008403361344,
    w: 0.1, h: 0.065, zIndex: 30,
  },
  atk: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 0, h: 0, zIndex: 40,
  },
  def: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 0, h: 0, zIndex: 40,
  },
  fontSize: 0.065,
};

// Trap card configuration (no stars, no ATK/DEF)
export const TRAP_CARD_CONFIG: AnimeCardConfig = {
  layout: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 1, h: 1, zIndex: 0,
  },
  artwork: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0.02274193548387097, y: 0.01869747899159664,
    w: 0.9633137829912024, h: 0.703781512605042, zIndex: 10,
  },
  stars: {
    anchor: 'top-center', pivot: { x: 0.5, y: 0 },
    x: 0, y: 0.85,
    size: 0, gap: 0, zIndex: 20,
  },
  attribute: {
    anchor: 'top-center', pivot: { x: 0.5, y: 0 },
    x: 0, y: 0.8321008403361344,
    w: 0.1, h: 0.065, zIndex: 30,
  },
  atk: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 0, h: 0, zIndex: 40,
  },
  def: {
    anchor: 'top-left', pivot: { x: 0, y: 0 },
    x: 0, y: 0, w: 0, h: 0, zIndex: 40,
  },
  fontSize: 0.065,
};

// Map of configurations by card type
export const CARD_CONFIGS: Record<CardConfigType, AnimeCardConfig> = {
  monster: MONSTER_CARD_CONFIG,
  spell: SPELL_CARD_CONFIG,
  trap: TRAP_CARD_CONFIG,
};

// Default/fallback configuration (monster)
export const DEFAULT_ANIME_CARD_CONFIG = MONSTER_CARD_CONFIG;

// Helper to get config by card type string
export function getConfigForCardType(cardType: string): AnimeCardConfig {
  const type = cardType.toLowerCase();
  
  if (type.includes('spell') || type.includes('magic')) {
    return SPELL_CARD_CONFIG;
  }
  if (type.includes('trap')) {
    return TRAP_CARD_CONFIG;
  }
  
  // Default to monster for all monster types and unknown types
  return MONSTER_CARD_CONFIG;
}
