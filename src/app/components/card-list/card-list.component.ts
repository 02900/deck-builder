import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Card } from '@classes/card/';
import { CardComponent } from '@components/card/card.component';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CardComponent],
})
export class CardListComponent {
  readonly cards = input.required<Card[]>();
}
