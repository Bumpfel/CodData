import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeapontypeSelectComponent } from './weapontype-select.component';

describe('WeapontypeSelectComponent', () => {
  let component: WeapontypeSelectComponent;
  let fixture: ComponentFixture<WeapontypeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeapontypeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeapontypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
