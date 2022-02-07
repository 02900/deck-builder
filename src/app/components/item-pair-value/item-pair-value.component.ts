import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-item-pair-value',
  templateUrl: './item-pair-value.component.html',
  styleUrls: ['./item-pair-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemPairValueComponent {
  @Input() key?: string | number;
  @Input() value?: string | number;
}
