import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListModule } from '@components/card-list/card-list.module';
import { FormSearchModule } from './form-search/form-search.module';
import { CardCatalogComponent } from './card-catalog.component';

@NgModule({
  declarations: [CardCatalogComponent],
  imports: [
    CommonModule,
    CardListModule,
    FormSearchModule,
  ],
  exports: [CardCatalogComponent],
})
export class CardCatalogModule { }
