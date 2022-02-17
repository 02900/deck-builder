import { TestBed } from '@angular/core/testing';

import { YgoApiService } from './ygo-api.service';

describe('YgoApiService', () => {
  let service: YgoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YgoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
