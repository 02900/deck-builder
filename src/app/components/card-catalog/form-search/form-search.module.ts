import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormSearchComponent } from './form-search.component';

@NgModule({
  declarations: [FormSearchComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [FormSearchComponent],
})
export class FormSearchModule { }
