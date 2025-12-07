export interface SavedDeck {
  id: string;
  name: string;
  mainDeck: number[]; // Card IDs
  extraDeck: number[]; // Card IDs
  sideDeck: number[]; // Card IDs (for future use)
  createdAt: number;
  updatedAt: number;
}

export interface DeckStorage {
  decks: SavedDeck[];
  currentDeckId: string | null;
}
