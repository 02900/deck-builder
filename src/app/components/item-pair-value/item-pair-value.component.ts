import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-item-pair-value',
  templateUrl: './item-pair-value.component.html',
  styleUrls: ['./item-pair-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemPairValueComponent {
  readonly key = input<string | number>();
  readonly value = input<string | number>();
}
