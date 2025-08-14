import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtaskAsignComponent } from './subtask-asign.component';

describe('SubtaskAsignComponent', () => {
  let component: SubtaskAsignComponent;
  let fixture: ComponentFixture<SubtaskAsignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtaskAsignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtaskAsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
