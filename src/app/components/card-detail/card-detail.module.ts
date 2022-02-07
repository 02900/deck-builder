import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from '@components/card/card.module';
import { CardDetailComponent } from './card-detail.component';

@NgModule({
  declarations: [CardDetailComponent],
  imports: [CommonModule, CardModule],
  exports: [CardDetailComponent],
})
export class CardDetailModule { }
