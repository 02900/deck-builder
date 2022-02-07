import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPairValueComponent } from './item-pair-value.component';

describe('ItemPairValueComponent', () => {
  let component: ItemPairValueComponent;
  let fixture: ComponentFixture<ItemPairValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemPairValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPairValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
