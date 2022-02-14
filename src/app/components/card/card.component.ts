import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CardSelectedService } from '@services/card-selected.service';
import { ICard } from './card.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() card!: ICard;
  @Input() selectableCard!: boolean;

  constructor(private readonly cardSelected: CardSelectedService) { }

  updateCardSelected() {
    this.cardSelected.current.next(this.card);
  }
}
