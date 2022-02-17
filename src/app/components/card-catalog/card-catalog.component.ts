import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { IQueryParams, YgoApiService } from '@services/ygo-api';
import { Card } from '@classes/card';

@Component({
  selector: 'app-card-catalog',
  templateUrl: './card-catalog.component.html',
  styleUrls: ['./card-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCatalogComponent {
  cards$?: Observable<Card[]>;

  constructor(private readonly ygoApi: YgoApiService) { }

  updateCatalog(queryParams: IQueryParams) {
    this.cards$ = this.ygoApi.query(queryParams);
  }

  drop(event: CdkDragDrop<Card[]>) {
    const index = event.previousIndex;
    event.previousContainer.data.splice(index, 1);
  }
}
