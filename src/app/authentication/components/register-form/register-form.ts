import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterDTO } from '../../types';
import { confirmPasswordValidator } from '../../validators';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'hb-register-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss'
})
export class RegisterForm {
  private readonly fb = inject(FormBuilder);
  
  protected readonly form = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(64)]],
    repeatPassword: ['', [Validators.required]]
  },
    {
      validators: confirmPasswordValidator
    });
  readonly submitForm = output<RegisterDTO>();

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
}
