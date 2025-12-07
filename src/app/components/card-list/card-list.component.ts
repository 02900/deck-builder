import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Card } from '@classes/card/';
import { CardComponent } from '@components/card/card.component';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CdkDropList, CardComponent],
})
export class CardListComponent {
  readonly cards = input.required<Card[]>();
  readonly listId = input.required<string>();
  readonly connectedTo = input<string[]>([]);
  readonly dropped = output<CdkDragDrop<Card[]>>();

  onDrop(event: CdkDragDrop<Card[]>): void {
    this.dropped.emit(event);
  }
}
