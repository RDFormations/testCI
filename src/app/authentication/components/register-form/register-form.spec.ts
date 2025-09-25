import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterForm } from './register-form';
import { provideZonelessChangeDetection } from '@angular/core';

describe('RegisterForm', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterForm],
      providers: [provideZonelessChangeDetection()] 

    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
