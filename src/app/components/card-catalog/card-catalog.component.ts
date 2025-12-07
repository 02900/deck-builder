import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import type { IQueryParams } from '@services/ygo-api';
import { YgoApiService } from '@services/ygo-api';
import { Card } from '@classes/card';
import { FormSearchComponent } from './form-search/form-search.component';
import { CardListComponent } from '@components/card-list/card-list.component';

@Component({
  selector: 'app-card-catalog',
  templateUrl: './card-catalog.component.html',
  styleUrls: ['./card-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, FormSearchComponent, CardListComponent],
})
export class CardCatalogComponent {
  private readonly ygoApi = inject(YgoApiService);
  private readonly queryParams$ = new Subject<IQueryParams>();

  readonly cards = toSignal(
    this.queryParams$.pipe(switchMap((params) => this.ygoApi.query(params))),
    { initialValue: [] as Card[] }
  );

  updateCatalog(queryParams: IQueryParams): void {
    this.queryParams$.next(queryParams);
  }

  drop(event: CdkDragDrop<Card[]>): void {
    event.previousContainer.data.splice(event.previousIndex, 1);
  }
}
