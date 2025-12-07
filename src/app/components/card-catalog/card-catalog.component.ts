import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import type { IQueryParams } from '@services/ygo-api';
import { YgoApiService } from '@services/ygo-api';
import { DeckService } from '@services/deck/deck.service';
import { Card } from '@classes/card';
import { FormSearchComponent } from './form-search/form-search.component';
import { CardListComponent } from '@components/card-list/card-list.component';

@Component({
  selector: 'app-card-catalog',
  templateUrl: './card-catalog.component.html',
  styleUrls: ['./card-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormSearchComponent, CardListComponent],
})
export class CardCatalogComponent {
  private readonly ygoApi = inject(YgoApiService);
  private readonly deckService = inject(DeckService);
  private readonly queryParams$ = new Subject<IQueryParams>();

  readonly cards = toSignal(
    this.queryParams$.pipe(switchMap((params) => this.ygoApi.query(params))),
    { initialValue: [] as Card[] }
  );

  updateCatalog(queryParams: IQueryParams): void {
    this.queryParams$.next(queryParams);
  }

  onCardDropped(event: CdkDragDrop<Card[]>): void {
    // Si la carta viene de un deck (no del catálogo), eliminarla del deck
    if (event.previousContainer.id !== 'catalog') {
      this.deckService.removeFromDeck(event.previousContainer.id, event.previousIndex);
    }
  }
}
