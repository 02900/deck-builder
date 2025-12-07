import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';
import { CardComponent } from '@components/card/card.component';
import { AnimeCardModalComponent } from '@components/anime-card-modal/anime-card-modal.component';
import { label as labelConstants } from './card-detail.constans';
import { darkMagician } from '@classes/card';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, AnimeCardModalComponent],
})
export class CardDetailComponent {
  private readonly cardSelected = inject(CardSelectedService);

  readonly label = labelConstants;
  readonly card = computed(() => this.cardSelected.current() ?? darkMagician);
  readonly showAnimeModal = signal(false);

  openAnimeModal(): void {
    this.showAnimeModal.set(true);
  }

  closeAnimeModal(): void {
    this.showAnimeModal.set(false);
  }
}
