import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtaskBoardColaboradorComponent } from './subtask-board-colaborador.component';

describe('SubtaskBoardColaboradorComponent', () => {
  let component: SubtaskBoardColaboradorComponent;
  let fixture: ComponentFixture<SubtaskBoardColaboradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtaskBoardColaboradorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtaskBoardColaboradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
