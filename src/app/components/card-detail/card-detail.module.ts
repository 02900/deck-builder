import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from '@components/card/card.module';
import { ItemPairValueModule } from '@components/item-pair-value/item-pair-value.module';
import { CardDetailComponent } from './card-detail.component';

@NgModule({
  declarations: [CardDetailComponent],
  imports: [CommonModule, CardModule, ItemPairValueModule],
  exports: [CardDetailComponent],
})
export class CardDetailModule { }
