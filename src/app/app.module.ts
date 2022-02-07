import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { CardModule } from "@components/card/card.module";
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, CardModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
