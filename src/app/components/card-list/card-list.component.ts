import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICard } from '@components/card/card.interface';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardListComponent {
  @Input() cards!: ICard[];
}
