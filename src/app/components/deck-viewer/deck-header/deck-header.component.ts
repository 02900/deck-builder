import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { label } from './deck-header.constant';

@Component({
  selector: 'app-deck-header',
  templateUrl: './deck-header.component.html',
  styleUrls: ['./deck-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeckHeaderComponent {
  @Input() icon!: string;
  @Input() name!: string;
  @Input() total!: number;
  readonly label = label;
}
