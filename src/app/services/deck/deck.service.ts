import { inject, Injectable, signal, computed } from '@angular/core';
import { Card } from '@classes/card';
import { YgoApiService } from '@services/ygo-api';
import { SavedDeck, DeckStorage } from './deck.interface';
import { firstValueFrom } from 'rxjs';

const STORAGE_KEY = 'ygo-deck-builder-storage';

@Injectable({
  providedIn: 'root',
})
export class DeckService {
  private readonly ygoApi = inject(YgoApiService);

  readonly mainDeck = signal<Card[]>([]);
  readonly extraDeck = signal<Card[]>([]);
  readonly savedDecks = signal<SavedDeck[]>([]);
  readonly currentDeckId = signal<string | null>(null);
  readonly currentDeckName = signal<string>('New Deck');

  readonly currentDeck = computed(() => {
    const id = this.currentDeckId();
    return this.savedDecks().find(d => d.id === id) ?? null;
  });

  constructor() {
    this.loadFromStorage();
  }

  // ============ Deck manipulation ============

  addToMainDeck(card: Card, index?: number): void {
    const deck = this.mainDeck();
    const insertIndex = index ?? deck.length;
    this.mainDeck.set([...deck.slice(0, insertIndex), card, ...deck.slice(insertIndex)]);
  }

  addToExtraDeck(card: Card, index?: number): void {
    const deck = this.extraDeck();
    const insertIndex = index ?? deck.length;
    this.extraDeck.set([...deck.slice(0, insertIndex), card, ...deck.slice(insertIndex)]);
  }

  removeFromMainDeck(index: number): void {
    const deck = [...this.mainDeck()];
    deck.splice(index, 1);
    this.mainDeck.set(deck);
  }

  removeFromExtraDeck(index: number): void {
    const deck = [...this.extraDeck()];
    deck.splice(index, 1);
    this.extraDeck.set(deck);
  }

  removeFromDeck(deckId: string, index: number): void {
    if (deckId === 'main-deck') {
      this.removeFromMainDeck(index);
    } else if (deckId === 'extra-deck') {
      this.removeFromExtraDeck(index);
    }
  }

  reorderMainDeck(fromIndex: number, toIndex: number): void {
    const deck = [...this.mainDeck()];
    const [removed] = deck.splice(fromIndex, 1);
    deck.splice(toIndex, 0, removed);
    this.mainDeck.set(deck);
  }

  reorderExtraDeck(fromIndex: number, toIndex: number): void {
    const deck = [...this.extraDeck()];
    const [removed] = deck.splice(fromIndex, 1);
    deck.splice(toIndex, 0, removed);
    this.extraDeck.set(deck);
  }

  transferCard(fromDeckId: string, toDeckId: string, fromIndex: number, toIndex: number): void {
    const sourceDeck = fromDeckId === 'main-deck' ? this.mainDeck : this.extraDeck;
    const targetDeck = toDeckId === 'main-deck' ? this.mainDeck : this.extraDeck;

    const sourceCards = [...sourceDeck()];
    const targetCards = [...targetDeck()];
    const [removed] = sourceCards.splice(fromIndex, 1);
    targetCards.splice(toIndex, 0, removed);

    sourceDeck.set(sourceCards);
    targetDeck.set(targetCards);
  }

  clearDeck(): void {
    this.mainDeck.set([]);
    this.extraDeck.set([]);
  }

  // ============ Storage ============

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const storage: DeckStorage = JSON.parse(data);
        this.savedDecks.set(storage.decks);
        if (storage.currentDeckId) {
          this.currentDeckId.set(storage.currentDeckId);
          const deck = storage.decks.find(d => d.id === storage.currentDeckId);
          if (deck) {
            this.currentDeckName.set(deck.name);
          }
        }
      }
    } catch (e) {
      console.error('Error loading decks from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      const storage: DeckStorage = {
        decks: this.savedDecks(),
        currentDeckId: this.currentDeckId(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (e) {
      console.error('Error saving decks to storage:', e);
    }
  }

  saveDeck(name: string): void {
    const now = Date.now();
    const existingId = this.currentDeckId();
    
    const deckData: SavedDeck = {
      id: existingId ?? crypto.randomUUID(),
      name,
      mainDeck: this.mainDeck().map(c => c.id),
      extraDeck: this.extraDeck().map(c => c.id),
      sideDeck: [],
      createdAt: existingId ? (this.currentDeck()?.createdAt ?? now) : now,
      updatedAt: now,
    };

    const decks = this.savedDecks();
    const existingIndex = decks.findIndex(d => d.id === deckData.id);
    
    if (existingIndex >= 0) {
      const updated = [...decks];
      updated[existingIndex] = deckData;
      this.savedDecks.set(updated);
    } else {
      this.savedDecks.set([...decks, deckData]);
    }

    this.currentDeckId.set(deckData.id);
    this.currentDeckName.set(name);
    this.saveToStorage();
  }

  async loadDeck(deckId: string): Promise<void> {
    const deck = this.savedDecks().find(d => d.id === deckId);
    if (!deck) return;

    this.currentDeckId.set(deckId);
    this.currentDeckName.set(deck.name);
    this.saveToStorage();

    // Load cards from API
    const allIds = [...deck.mainDeck, ...deck.extraDeck];
    if (allIds.length === 0) {
      this.clearDeck();
      return;
    }

    try {
      const cards = await firstValueFrom(this.ygoApi.getCardsByIds(allIds));
      const cardMap = new Map(cards.map(c => [c.id, c]));

      this.mainDeck.set(deck.mainDeck.map(id => cardMap.get(id)!).filter(Boolean));
      this.extraDeck.set(deck.extraDeck.map(id => cardMap.get(id)!).filter(Boolean));
    } catch (e) {
      console.error('Error loading deck cards:', e);
    }
  }

  deleteDeck(deckId: string): void {
    this.savedDecks.set(this.savedDecks().filter(d => d.id !== deckId));
    if (this.currentDeckId() === deckId) {
      this.currentDeckId.set(null);
      this.currentDeckName.set('New Deck');
      this.clearDeck();
    }
    this.saveToStorage();
  }

  newDeck(): void {
    this.currentDeckId.set(null);
    this.currentDeckName.set('New Deck');
    this.clearDeck();
  }

  // ============ YDK Export/Import ============

  exportToYdk(): string {
    const lines: string[] = [];
    lines.push('#created by YGO Deck Builder');
    lines.push('#main');
    this.mainDeck().forEach(card => lines.push(String(card.id)));
    lines.push('#extra');
    this.extraDeck().forEach(card => lines.push(String(card.id)));
    lines.push('!side');
    // Side deck empty for now
    return lines.join('\n');
  }

  downloadYdk(filename?: string): void {
    const content = this.exportToYdk();
    const name = filename ?? this.currentDeckName() ?? 'deck';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.ydk`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importFromYdk(content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const lines = content.split('\n').map(l => l.trim()).filter(l => l);
      const mainIds: number[] = [];
      const extraIds: number[] = [];
      const sideIds: number[] = [];
      
      let currentSection: 'main' | 'extra' | 'side' = 'main';

      for (const line of lines) {
        if (line.startsWith('#main')) {
          currentSection = 'main';
        } else if (line.startsWith('#extra')) {
          currentSection = 'extra';
        } else if (line.startsWith('!side')) {
          currentSection = 'side';
        } else if (line.startsWith('#') || line.startsWith('!')) {
          // Skip comments
        } else {
          const id = parseInt(line, 10);
          if (!isNaN(id)) {
            if (currentSection === 'main') mainIds.push(id);
            else if (currentSection === 'extra') extraIds.push(id);
            else sideIds.push(id);
          }
        }
      }

      const allIds = [...mainIds, ...extraIds, ...sideIds];
      if (allIds.length === 0) {
        return { success: false, error: 'No valid card IDs found in file' };
      }

      const cards = await firstValueFrom(this.ygoApi.getCardsByIds(allIds));
      const cardMap = new Map(cards.map(c => [c.id, c]));

      this.mainDeck.set(mainIds.map(id => cardMap.get(id)!).filter(Boolean));
      this.extraDeck.set(extraIds.map(id => cardMap.get(id)!).filter(Boolean));
      
      // Reset current deck since this is an import
      this.currentDeckId.set(null);
      this.currentDeckName.set('Imported Deck');

      return { success: true };
    } catch (e) {
      console.error('Error importing YDK:', e);
      return { success: false, error: 'Failed to load cards from API' };
    }
  }
}
