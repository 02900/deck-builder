import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICard } from '@components/card/card.interface';
import { darkMagician } from '@components/card/card.mock';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardDetailComponent {
  @Input() card: ICard = darkMagician;
}
