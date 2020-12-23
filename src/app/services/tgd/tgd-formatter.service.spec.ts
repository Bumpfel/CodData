import { TestBed } from '@angular/core/testing';

import { TgdFormatterService } from './tgd-formatter.service';

describe('TgdFormatterService', () => {
  let service: TgdFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TgdFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
