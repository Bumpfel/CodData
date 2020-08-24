import { TestBed } from '@angular/core/testing';

import { TgdService } from './tgd.service';

describe('TgdService', () => {
  let service: TgdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TgdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
