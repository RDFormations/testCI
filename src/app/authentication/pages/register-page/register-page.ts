import { Component, inject, input, signal } from '@angular/core';
import { RegisterForm } from "../../components/register-form/register-form";
import { AuthenticationApi } from '../../authentication-api';
import { CredentialDTO, RegisterDTO } from '../../types';
import { LoginForm } from "../../components/login-form/login-form";
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'hb-register-page',
  imports: [RegisterForm, MatButtonModule, LoginForm],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss'
})
export class RegisterPage {

  private readonly router = inject(Router);
  private readonly authApi = inject(AuthenticationApi);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly serverError = signal('');
  protected readonly isLogin = signal(true);
  readonly redirectUrl = input<string>();

  register(formValue:RegisterDTO) {
    this.serverError.set('');
    this.authApi.register(formValue).subscribe({
      next: () => {
        this.switchForm()
        this.snackBar.open('Registration successful, please check your email and login', 'Ok', {duration: 5000,verticalPosition:'top', horizontalPosition:'right'})
      },
      error: (err) => this.serverError.set(err.error?.detail ?? 'Server unreachable')
    });
  }

  login(formValue:CredentialDTO) {
    this.serverError.set('');
    this.authApi.login(formValue).subscribe({
      next: () => {
        console.log(this.redirectUrl());
        this.router.navigateByUrl(this.redirectUrl() ?? '/');
        this.snackBar.open('Login successful', 'Ok', {duration: 5000,verticalPosition:'top', horizontalPosition:'right'})
      },
      error: (err) => {
        if(err.status == 403) {
          this.serverError.set('Invalid credentials')
        }else {
          this.serverError.set('Error with server');
        }
      }
    });

  }

  switchForm() {
    this.isLogin.update(val => !val);
    this.serverError.set('');
  }

}
