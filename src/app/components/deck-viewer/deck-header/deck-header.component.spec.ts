import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckHeaderComponent } from './deck-header.component';

describe('DeckHeaderComponent', () => {
  let component: DeckHeaderComponent;
  let fixture: ComponentFixture<DeckHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeckHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
