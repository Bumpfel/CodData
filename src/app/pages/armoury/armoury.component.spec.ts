import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmouryComponent } from './armoury.component';

describe('ArmouryComponent', () => {
  let component: ArmouryComponent;
  let fixture: ComponentFixture<ArmouryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArmouryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArmouryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
