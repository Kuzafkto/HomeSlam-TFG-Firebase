import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRegisterInfo } from '../../../core/interfaces/user-register-info';

/**
 * Component for displaying and handling a register form.
 */
@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnInit {
  
  /**
   * Event emitted when the form is submitted.
   */
  @Output() onsubmit = new EventEmitter<UserRegisterInfo>();

  /**
   * Form group for the register form.
   */
  form: FormGroup | null = null;

  /**
   * Constructor for RegisterFormComponent.
   * 
   * @param formBuilder FormBuilder service for creating forms.
   */
  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(12)]],
      nickname: ['', [Validators.required, Validators.minLength(2)]]
    }, { validator: this.passwordMatchValidator });
  }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {}

  /**
   * Handles form submission.
   * Emits the form value and clears the password fields.
   */
  onSubmit() {
    this.onsubmit.emit(this.form?.value);
    this.form?.controls['password'].setValue('');
    this.form?.controls['confirmPassword'].setValue('');
  }

  /**
   * Custom validator to check if password and confirmPassword fields match.
   * @param formGroup The form group to validate.
   * @returns An object if the validation fails, null otherwise.
   */
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}
