import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, copyArrayItem } from '@angular/cdk/drag-drop';
import { ICard } from '@components/card/card.interface';

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckViewerComponent {
  mainDeck: ICard[] = [];
  extraDeck: ICard[] = [];

  drop(event: CdkDragDrop<ICard[]>) {
    copyArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
