import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';
import { Card } from '@classes/card/';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  private readonly cardSelected = inject(CardSelectedService);

  readonly card = input.required<Card>();
  readonly selectableCard = input(false);

  updateCardSelected(): void {
    this.cardSelected.select(this.card());
  }
}
