import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListModule } from '@components/card-list/card-list.module';
import { DeckHeaderModule } from './deck-header/deck-header.module';
import { DeckViewerComponent } from './deck-viewer.component';

@NgModule({
  declarations: [DeckViewerComponent],
  imports: [CommonModule, CardListModule, DeckHeaderModule],
  exports: [DeckViewerComponent],
})
export class DeckViewerModule { }
