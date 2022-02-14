import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICard } from '@components/card/card.interface';
import { darkHole, darkMagician, mirrorForce } from '@components/card/card.mock';

@Component({
  selector: 'app-deck-viewer',
  templateUrl: './deck-viewer.component.html',
  styleUrls: ['./deck-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeckViewerComponent {
  mainDeck: ICard[] = [];
  extraDeck: ICard[] = [];
}
