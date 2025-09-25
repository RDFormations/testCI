import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPage } from './register-page';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideZonelessChangeDetection(),//nécessaire car application sans zone.js
        provideHttpClient(),
        provideHttpClientTesting(), //Fait que les requêtes HTTP ne partent pas pour de vrai
        //On crée un spy pour le Router
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    })
      .compileComponents();
    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with h1 element and login form', () => {
    expect(component).toBeTruthy();
    const { debugElement } = fixture;
    const pageTitle: HTMLElement = debugElement.query(By.css('h1')).nativeElement;
    expect(pageTitle.textContent).toEqual('Register');

    const loginForm = debugElement.query(By.css('hb-login-form'));
    expect(loginForm).toBeTruthy();
  });

  it('should display register form on switch click', () => {
    const { debugElement } = fixture;

    //On récupère le bouton qui permet de changer de formulaire
    const switchButton = debugElement.query(By.css('[data-test="sign-up"]'));
    //On déclenche un click dessus
    switchButton.triggerEventHandler('click');
    //On déclenche la détection de modification d'interface
    fixture.detectChanges();
    
    //On vérifie que le login-form n'est plus présent mais que le register-form est présent
    const loginForm = debugElement.query(By.css('hb-login-form'));
    expect(loginForm).toBeFalsy();
    const registerForm = debugElement.query(By.css('hb-register-form'));
    expect(registerForm).toBeTruthy();




  });

  it('should send login request on form submit', () => {
    //On récupère le spy qu'on a provide dans le beforeEach
    const spyRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    //On peut récupérer cet utilitaire du fait qu'on a fait un provideHttpClientTesting dans le beforeEach
    const httpTesting = TestBed.inject(HttpTestingController);
    const { debugElement } = fixture;
    const loginForm = debugElement.query(By.css('hb-login-form'));
    loginForm.triggerEventHandler('submitForm');

    //Grâce au HttpTestingController, on vérifie qu'une requête vers la route /api/login a été faite
    httpTesting.expectOne('/api/login', 'Login request sent').flush({ message: 'Success' });

    //On vérifie avec le spy que la méthode navigate du router a été appelée une fois
    expect(spyRouter.navigate.calls.count()).toBe(1)

    //On vérifie qu'aucune autre requête Http que celle expect n'a été faite
    httpTesting.verify();
  })

  
});
