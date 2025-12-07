import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import type { IQueryParams } from '@services/ygo-api';
import { ISearchParams, SearchParams, Category } from './form-search.utils';
import {
  categories,
  types,
  attributes,
  races,
  texts,
} from './form-search.constant';

const DELAY_TIME = 500;

@Component({
  selector: 'app-form-search',
  templateUrl: './form-search.component.html',
  styleUrls: ['./form-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class FormSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly valueChanged = output<IQueryParams>();

  readonly categories = categories;
  readonly attributes = attributes;
  readonly races = races;
  readonly texts = texts;

  readonly formSearch = this.fb.group({
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

  readonly currentType = signal<{ value: string; text: string }[] | undefined>(undefined);

  ngOnInit(): void {
    this.listenCategorySelect();
    this.listenFormChanges();
  }

  private listenFormChanges(): void {
    this.formSearch.valueChanges
      .pipe(debounceTime(DELAY_TIME), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const searchParams = new SearchParams(value as ISearchParams);
        this.valueChanged.emit(searchParams.toQueryParams());
      });
  }

  private listenCategorySelect(): void {
    this.formSearch
      .get('category')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newCategory) => {
        this.setDefaultCategory();
        this.applyCategoryFilter(newCategory as Category);
      });
  }

  private setDefaultCategory(): void {
    this.currentType.set(undefined);
    this.formSearch.patchValue({ type: '' });
    this.formSearch.get('type')?.disable();
    this.formSearch.get('race')?.enable();
    this.formSearch.get('attribute')?.enable();
  }

  private applyCategoryFilter(newCategory: Category): void {
    if (types[newCategory]) {
      this.currentType.set(types[newCategory]);
      this.formSearch.get('type')?.enable();

      if (newCategory !== Category.Monster) {
        this.formSearch.get('race')?.disable();
        this.formSearch.get('attribute')?.disable();
      }
    }
  }
}
