import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailComponent {
  constructor(readonly cardSelected: CardSelectedService) { }
}
