import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const confirmPasswordValidator: ValidatorFn = (control:AbstractControl): ValidationErrors|null =>  {
    if(control.value.password !== control.value.repeatPassword) {
        control.get('repeatPassword')?.setErrors({PasswordNoRepeat:true})
    } 
    return null;
    
}