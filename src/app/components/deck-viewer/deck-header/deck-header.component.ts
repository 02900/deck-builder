import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ItemPairValueComponent } from '@components/item-pair-value/item-pair-value.component';

@Component({
  selector: 'app-deck-header',
  templateUrl: './deck-header.component.html',
  styleUrls: ['./deck-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemPairValueComponent],
})
export class DeckHeaderComponent {
  readonly icon = input<string>();
  readonly name = input.required<string>();
  readonly total = input.required<number>();
}
