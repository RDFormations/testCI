import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CredentialDTO } from '../../types';

@Component({
  selector: 'hb-login-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm {
 private readonly fb = inject(FormBuilder);
  
  protected readonly form = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(64)]]  });
  readonly submitForm = output<CredentialDTO>();

  handleSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsDirty();
      return
    }
    this.submitForm.emit({
      email: this.form.value.email!,
      password: this.form.value.password!
    });
  }

  /**
   * Méthode utilisé par les tests pour assigner des valeurs au formulaire. On pourrait
   * également passer par un input
   */
  get setValue() {
    return this.form.setValue.bind(this.form);
  }
}
