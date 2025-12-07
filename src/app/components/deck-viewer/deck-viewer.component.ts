import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CdkDragDrop, CdkDropList, copyArrayItem } from '@angular/cdk/drag-drop';
import { Card } from '@classes/card';
import { text } from './deck-viewer.constant';
import { DeckHeaderComponent } from './deck-header/deck-header.component';
import { CardListComponent } from '@components/card-list/card-list.component';

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, DeckHeaderComponent, CardListComponent],
})
export class DeckViewerComponent {
  readonly text = text;

  readonly mainDeck = signal<Card[]>([]);
  readonly extraDeck = signal<Card[]>([]);

  drop(event: CdkDragDrop<Card[]>): void {
    copyArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    // Trigger signal update
    if (event.container.data === this.mainDeck()) {
      this.mainDeck.set([...event.container.data]);
    } else {
      this.extraDeck.set([...event.container.data]);
    }
  }
}
