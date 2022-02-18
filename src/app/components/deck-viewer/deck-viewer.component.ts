import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, copyArrayItem } from '@angular/cdk/drag-drop';
import { Card } from '@classes/card';
import { text } from './deck-viewer.constant';

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckViewerComponent {
  readonly text = text;

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
