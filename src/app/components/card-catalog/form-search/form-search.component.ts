import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import type { IQueryParams } from '@services/ygo-api';
import { ISearchParams, SearchParams, Category } from './form-search.utils';
import {
  categories,
  types,
  attributes,
  races,
  texts,
} from './form-search.constant';

const delayTime = 500;

@Component({
  selector: 'app-form-search',
  templateUrl: './form-search.component.html',
  styleUrls: ['./form-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FormSearchComponent implements OnInit {
  @Output() valueChanged = new EventEmitter<IQueryParams>();

  private readonly fb = inject(FormBuilder);

  readonly categories = categories;
  readonly attributes = attributes;
  readonly races = races;
  readonly texts = texts;

  readonly formSearch: FormGroup = this.fb.group({
    id: [''],
    category: [''],
    type: [{ value: '', disabled: true }],
    attribute: [''],
    race: [''],
    query: [''],
    atk: [''],
    def: [''],
    level: [''],
    link: [''],
  });

  currentType?: any[];

  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.listenCategorySelect();
    this.listenFormChanges();
  }

  private listenFormChanges() {
    this.formSearch.valueChanges
      .pipe(debounceTime(delayTime), takeUntil(this.unsubscribe$))
      .subscribe((value: ISearchParams) => {
        const searchParams = new SearchParams(value);
        this.valueChanged.emit(searchParams.toQueryParams())
      }
      );
  }

  private listenCategorySelect(): void {
    this.formSearch
      .get('category')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((newCategory: Category) => {
        this.setDefaultCategory();
        this.applyCategoryFilter(newCategory);
      });
  }

  private setDefaultCategory(): void {
    this.currentType = undefined;
    this.formSearch.patchValue({ type: '' });
    this.formSearch.get('type')?.disable();
    this.formSearch.get('race')?.enable();
    this.formSearch.get('attribute')?.enable();
  }

  private applyCategoryFilter(newCategory: Category): void {
    if (types[newCategory]) {
      this.currentType = types[newCategory];
      this.formSearch.get('type')?.enable();

      if (newCategory !== Category.Monster) {
        this.formSearch.get('race')?.disable();
        this.formSearch.get('attribute')?.disable();
      }
    }
  }
}
