import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ICard } from './card.interface';
import { darkMagician } from './card.mock';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() card: ICard = darkMagician;
}
