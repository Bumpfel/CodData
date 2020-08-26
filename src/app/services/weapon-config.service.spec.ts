import { TestBed } from '@angular/core/testing';

import { WeaponConfigService } from './weapon-config.service';

describe('WeaponConfigService', () => {
  let service: WeaponConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeaponConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
