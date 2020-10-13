import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmgProfileComponent } from './dmg-profile.component';

describe('DmgProfileComponent', () => {
  let component: DmgProfileComponent;
  let fixture: ComponentFixture<DmgProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmgProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmgProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
