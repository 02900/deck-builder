// Anime Card Layout Configuration
// All values are relative (0 to 1) based on canvas dimensions
// Edit these values to adjust element positioning

export interface AnimeCardConfig {
  // Layout frame overlay
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // Artwork area (where the card image is clipped)
  artwork: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // Level stars row
  stars: {
    y: number;
    size: number;
    gap: number;
  };
  // Attribute icon
  attribute: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // ATK box
  atk: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // DEF box
  def: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // Font size (relative to height)
  fontSize: number;
}

// Card type for configuration selection
export type CardConfigType = 'monster' | 'spell' | 'trap';

// Monster card configuration (also used as fallback)
export const MONSTER_CARD_CONFIG: AnimeCardConfig = {
  layout: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  artwork: {
    x: 0.07846041055718475,
    y: 0.07331932773109244,
    w: 0.8460117302052786,
    h: 0.6360924369747899,
  },
  stars: {
    y: 0.7423109243697479,
    size: 0.038,
    gap: 0.005,
  },
  attribute: {
    x: 0.7620234604105572,
    y: 0.728109243697479,
    w: 0.1,
    h: 0.065,
  },
  atk: {
    x: 0.13030205278592377,
    y: 0.8034033613445378,
    w: 0.38,
    h: 0.12,
  },
  def: {
    x: 0.5227419354838709,
    y: 0.8055042016806723,
    w: 0.3389442815249267,
    h: 0.09478991596638654,
  },
  fontSize: 0.065,
};

// Spell card configuration (no stars, no ATK/DEF)
export const SPELL_CARD_CONFIG: AnimeCardConfig = {
  layout: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  artwork: {
    x: 0.07846041055718475,
    y: 0.07331932773109244,
    w: 0.8460117302052786,
    h: 0.75,
  },
  stars: {
    y: 0.85,
    size: 0,
    gap: 0,
  },
  attribute: {
    x: 0.4448680351906158,
    y: 0.7900840336134454,
    w: 0.1,
    h: 0.065,
  },
  atk: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  },
  def: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  },
  fontSize: 0.065,
};

// Trap card configuration (no stars, no ATK/DEF)
export const TRAP_CARD_CONFIG: AnimeCardConfig = {
  layout: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  artwork: {
    x: 0.07846041055718475,
    y: 0.07331932773109244,
    w: 0.8460117302052786,
    h: 0.75,
  },
  stars: {
    y: 0.85,
    size: 0,
    gap: 0,
  },
  attribute: {
    x: 0.4448680351906158,
    y: 0.7900840336134454,
    w: 0.1,
    h: 0.065,
  },
  atk: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  },
  def: {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
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
