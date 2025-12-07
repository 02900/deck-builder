import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  computed,
} from '@angular/core';
import { CardSelectedService } from '@services/card-selected/card-selected.service';
import { Card } from '@classes/card/';

type CardImageType = 'small' | 'cropped' | 'regular';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class CardComponent {
  private readonly cardSelected = inject(CardSelectedService);

  readonly card = input.required<Card>();
  readonly selectableCard = input(false);
  readonly imageType = input<CardImageType>('small');

  readonly imageUrl = computed(() => {
    const images = this.card().card_images[0];
    switch (this.imageType()) {
      case 'cropped':
        return images.image_url_cropped;
      case 'regular':
        return images.image_url;
      case 'small':
      default:
        return images.image_url_small;
    }
  });

  updateCardSelected() {
    this.cardSelected.select(this.card());
  }
}
