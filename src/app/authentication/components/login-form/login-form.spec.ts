import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginForm } from './login-form';
import { input, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CredentialDTO } from '../../types';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideZonelessChangeDetection()]

    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a form with credentials inputs', () => {
    const { debugElement } = fixture;

    expect(component).toBeTruthy();
    const inputEmail = debugElement.query(By.css('input[type="email"]'));
    expect(inputEmail).toBeTruthy();

    const inputPassword = debugElement.query(By.css('input[type="password"]'));
    expect(inputPassword).toBeTruthy();
  });

  it('should display validation errors on submit', () => {
    const { debugElement } = fixture;

    //On submit le formulaire
    const form = debugElement.query(By.css('form'));
    form.triggerEventHandler('submit');
    fixture.detectChanges();

    //On vérifie qu'on a bien 2 erreurs de validation qui s'affichent dans le component
    const errors = debugElement.queryAll(By.css('mat-error'))

    expect(errors.length).toBe(2);
  });

  it('should trigger output if inputs are valid', () => {
    const { debugElement } = fixture;
        //On crée un spy sur le submitForm pour voir si l'output est bien emit

    spyOn(component.submitForm, 'emit');

    //On récupère les inputs
    const inputEmail = debugElement.query(By.css('input[type="email"]'));
    //On leur assigne une valeur
    inputEmail.nativeElement.value = 'bloup@test.com'
    //On déclenche l'event input pour notifier le changement de valeur
    inputEmail.nativeElement.dispatchEvent(new Event('input'))
    const inputPassword = debugElement.query(By.css('input[type="password"]'));
    inputPassword.nativeElement.value = '1234';
    inputPassword.nativeElement.dispatchEvent(new Event('input'))

    //On déclenche le formulaire
    const form = debugElement.query(By.css('form'));
    form.triggerEventHandler('submit');
    fixture.detectChanges();

    //On vérifie que le submitForm a bien été appelé avec les valeurs des inputs
    expect(component.submitForm.emit).toHaveBeenCalledWith({
      email: 'bloup@test.com',
      password: '1234'
    });


  });

  it('should trigger output if inputs are valid, via reactive form values', () => {
    const { debugElement } = fixture;
    //On crée un spy sur le submitForm pour voir si l'output est bien emit
    spyOn(component.submitForm, 'emit');

    //Ici on passe directement par le setValue du form dans la component pour assigner
    //les valeurs sans passer par les inputs
    component.setValue({
      email: 'bloup@test.com',
      password: '1234'
    });

    const form = debugElement.query(By.css('form'));
    form.triggerEventHandler('submit');
    fixture.detectChanges();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      email: 'bloup@test.com',
      password: '1234'
    });


  });
});
