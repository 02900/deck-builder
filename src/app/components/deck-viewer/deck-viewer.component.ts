import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Card } from '@classes/card';
import { DeckService } from '@services/deck/deck.service';
import { text } from './deck-viewer.constant';
import { DeckHeaderComponent } from './deck-header/deck-header.component';
import { CardComponent } from '@components/card/card.component';

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, DeckHeaderComponent, CardComponent],
})
export class DeckViewerComponent {
  private readonly deckService = inject(DeckService);

  readonly text = text;
  readonly mainDeck = this.deckService.mainDeck;
  readonly extraDeck = this.deckService.extraDeck;

  drop(event: CdkDragDrop<Card[]>, target: 'main' | 'extra'): void {
    const targetDeckId = target === 'main' ? 'main-deck' : 'extra-deck';
    const isFromCatalog = event.previousContainer.id === 'catalog';

    if (isFromCatalog) {
      // Copy from catalog to deck
      const card = event.previousContainer.data[event.previousIndex];
      if (target === 'main') {
        this.deckService.addToMainDeck(card, event.currentIndex);
      } else {
        this.deckService.addToExtraDeck(card, event.currentIndex);
      }
    } else if (event.previousContainer === event.container) {
      // Reorder within same deck
      if (target === 'main') {
        this.deckService.reorderMainDeck(event.previousIndex, event.currentIndex);
      } else {
        this.deckService.reorderExtraDeck(event.previousIndex, event.currentIndex);
      }
    } else {
      // Transfer between decks
      this.deckService.transferCard(
        event.previousContainer.id,
        targetDeckId,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
