import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';
import { darkMagician } from '@classes/card';
import { label } from './card-detail.constans';
import { CardComponent } from '@components/card/card.component';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
})
export class CardDetailComponent {
  private readonly cardSelected = inject(CardSelectedService);

  readonly label = label;
  readonly card = computed(() => this.cardSelected.current() ?? darkMagician);
}
