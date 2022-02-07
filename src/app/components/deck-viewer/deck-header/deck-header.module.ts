import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPairValueModule } from '@components/item-pair-value/item-pair-value.module';
import { DeckHeaderComponent } from './deck-header.component';

@NgModule({
  declarations: [DeckHeaderComponent],
  imports: [CommonModule, ItemPairValueModule],
  exports: [DeckHeaderComponent],
})
export class DeckHeaderModule { }
