import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentSelectComponent } from './attachment-select.component';

describe('AttachmentSelectComponent', () => {
  let component: AttachmentSelectComponent;
  let fixture: ComponentFixture<AttachmentSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
