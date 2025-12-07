import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';
import { darkMagician } from '@classes/card'
import { label } from './card-detail.constans';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CardDetailComponent {
  readonly label = label;
  readonly darkMagician = darkMagician;

  constructor(readonly cardSelected: CardSelectedService) { }
}
