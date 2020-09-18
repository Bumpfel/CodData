import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GunsmithComponent } from './gunsmith.component';

describe('GunsmithComponent', () => {
  let component: GunsmithComponent;
  let fixture: ComponentFixture<GunsmithComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GunsmithComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GunsmithComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
