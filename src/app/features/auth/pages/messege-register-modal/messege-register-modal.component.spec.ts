import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessegeRegisterModalComponent } from './messege-register-modal.component';

describe('MessegeRegisterModalComponent', () => {
  let component: MessegeRegisterModalComponent;
  let fixture: ComponentFixture<MessegeRegisterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessegeRegisterModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessegeRegisterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
