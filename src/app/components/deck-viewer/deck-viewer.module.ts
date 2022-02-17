import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardListModule } from '@components/card-list/card-list.module';
import { DeckHeaderModule } from './deck-header/deck-header.module';
import { DeckViewerComponent } from './deck-viewer.component';

@NgModule({
  declarations: [DeckViewerComponent],
  imports: [CommonModule, DragDropModule, CardListModule, DeckHeaderModule],
  exports: [DeckViewerComponent],
})
export class DeckViewerModule { }
