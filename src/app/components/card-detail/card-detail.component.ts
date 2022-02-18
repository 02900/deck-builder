import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';
import { label } from './card-detail.constans';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDetailComponent {
  readonly label = label;

  constructor(readonly cardSelected: CardSelectedService) { }
}
