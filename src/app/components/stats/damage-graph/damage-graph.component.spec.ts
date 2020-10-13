import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DamageGraphComponent } from './damage-graph.component';

describe('DamageGraphComponent', () => {
  let component: DamageGraphComponent;
  let fixture: ComponentFixture<DamageGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DamageGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DamageGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
