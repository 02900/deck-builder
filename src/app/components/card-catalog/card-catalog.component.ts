import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable, of } from 'rxjs';
import { IQueryParams, YgoApiService } from '@services/ygo-api';
import { ICard } from '@components/card/card.interface';
import {
  darkMagician,
  mirrorForce,
  darkHole,
} from '@components/card/card.mock';

@Component({
  selector: 'app-card-catalog',
  templateUrl: './card-catalog.component.html',
  styleUrls: ['./card-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCatalogComponent {
  cards$: Observable<ICard[]> = of([darkMagician, mirrorForce, darkHole]);

  constructor(private readonly ygoApi: YgoApiService) { }

  updateCatalog(queryParams: IQueryParams) {
    this.cards$ = this.ygoApi.query(queryParams);
  }

  drop(event: CdkDragDrop<ICard[]>) {
    const index = event.previousIndex;
    event.previousContainer.data.splice(index, 1);
  }
}
