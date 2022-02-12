import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { categories, types, attributes, races, texts } from './form-search.constant';

type TCategory = 'monster' | 'spell' | 'trap';

@Component({
  selector: 'app-form-search',
  templateUrl: './form-search.component.html',
  styleUrls: ['./form-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSearchComponent implements OnInit {
  readonly categories = categories;
  readonly attributes = attributes;
  readonly races = races;
  readonly texts = texts;

  readonly formSearch: FormGroup = this.fb.group({
    category: [''],
    type: [''],
    race: [''],
    attribute: [''],
    query: [''],
  });

  currentType = types.all;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.listenCategorySelect();
    this.listenFormChanges();
  }

  private listenFormChanges() {
    this.formSearch.valueChanges
      .pipe(debounceTime(500), takeUntil(this.unsubscribe$));
  }

  private listenCategorySelect(): void {
    this.formSearch
      .get('category')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((newCategory: TCategory) => {
        this.setDefaultCategory();
        this.applyCategoryFilter(newCategory);
      });
  }

  private setDefaultCategory(): void {
    this.currentType = types.all;
    this.formSearch.get('race')?.enable();
    this.formSearch.get('attribute')?.enable();
  }

  private applyCategoryFilter(newCategory: TCategory): void {
    if (types[newCategory]) {
      this.currentType = types[newCategory];
      this.formSearch.patchValue({ type: '' });

      if (newCategory !== 'monster') {
        this.formSearch.get('race')?.disable();
        this.formSearch.get('attribute')?.disable();
      }
    }
  }
}
