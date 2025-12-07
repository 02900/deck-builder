// Anime Card Layout Configuration
// All values are relative (0 to 1) based on canvas dimensions
// Edit these values to adjust element positioning

export interface AnimeCardConfig {
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

export const DEFAULT_ANIME_CARD_CONFIG: AnimeCardConfig = {
  artwork: {
    x: 0.055,
    y: 0.025,
    w: 0.89,
    h: 0.655,
  },
  stars: {
    y: 0.715,
    size: 0.038,
    gap: 0.005,
  },
  attribute: {
    x: 0.85,
    y: 0.705,
    w: 0.10,
    h: 0.065,
  },
  atk: {
    x: 0.065,
    y: 0.795,
    w: 0.38,
    h: 0.12,
  },
  def: {
    x: 0.555,
    y: 0.795,
    w: 0.38,
    h: 0.12,
  },
  fontSize: 0.065,
};
