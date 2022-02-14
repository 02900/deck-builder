import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CardDetailModule } from '@components/card-detail/card-detail.module';
import { DeckViewerModule } from '@components/deck-viewer/deck-viewer.module';
import { CardCatalogModule } from '@components/card-catalog/card-catalog.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    CardDetailModule,
    DeckViewerModule,
    CardCatalogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
