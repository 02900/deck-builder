import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Card } from '@classes/card/';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent {
  @Input() cards!: Card[];
}
