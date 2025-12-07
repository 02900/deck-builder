import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardDetailModule } from '@components/card-detail/card-detail.module';
import { DeckViewerModule } from '@components/deck-viewer/deck-viewer.module';
import { CardCatalogModule } from '@components/card-catalog/card-catalog.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    DragDropModule,
    CardDetailModule,
    DeckViewerModule,
    CardCatalogModule,
  ],
  providers: [provideHttpClient(withFetch())],
  bootstrap: [AppComponent],
})
export class AppModule { }
