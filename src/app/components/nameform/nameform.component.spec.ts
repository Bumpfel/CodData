import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NameformComponent } from './nameform.component';

describe('NameformComponent', () => {
  let component: NameformComponent;
  let fixture: ComponentFixture<NameformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
