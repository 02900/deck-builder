import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, copyArrayItem } from '@angular/cdk/drag-drop';
import { Card } from '@classes/card';

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckViewerComponent {
  mainDeck: Card[] = [];
  extraDeck: Card[] = [];

  drop(event: CdkDragDrop<Card[]>) {
    copyArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
