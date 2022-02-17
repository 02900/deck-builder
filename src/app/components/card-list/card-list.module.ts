import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardModule } from '@components/card/card.module';
import { CardListComponent } from './card-list.component';

@NgModule({
  declarations: [CardListComponent],
  imports: [CommonModule, DragDropModule, CardModule],
  exports: [CardListComponent],
})
export class CardListModule { }
