import { Injectable, signal } from '@angular/core';
import { Card } from '@classes/card';

@Injectable({
  providedIn: 'root',
})
export class DeckService {
  readonly mainDeck = signal<Card[]>([]);
  readonly extraDeck = signal<Card[]>([]);

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
}
