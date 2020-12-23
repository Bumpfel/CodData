import { TestBed } from '@angular/core/testing';

import { TgdFetchService } from './tgd-fetch.service';

describe('TgdFetchService', () => {
  let service: TgdFetchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TgdFetchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
