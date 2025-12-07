import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CardDetailComponent } from '@components/card-detail/card-detail.component';
import { DeckViewerComponent } from '@components/deck-viewer/deck-viewer.component';
import { CardCatalogComponent } from '@components/card-catalog/card-catalog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropListGroup, CardDetailComponent, DeckViewerComponent, CardCatalogComponent],
})
export class AppComponent {}
