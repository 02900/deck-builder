import { TestBed } from '@angular/core/testing';

import { CardSelectedService } from './card-selected.service';

describe('CardSelectedService', () => {
  let service: CardSelectedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardSelectedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
