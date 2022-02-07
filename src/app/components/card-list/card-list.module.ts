import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from '@components/card/card.module';
import { CardListComponent } from './card-list.component';

@NgModule({
  declarations: [CardListComponent],
  imports: [CommonModule, CardModule],
  exports: [CardListComponent],
})
export class CardListModule { }
