import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserCredentials } from 'src/app/core/interfaces/user-credentials';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {

  /**
   * Input property to set the username value in the form
   */
  @Input('username') set username(value: string) {
    this.form?.controls['username'].setValue(value);
  }

  /**
   * Output event emitter to emit the form values on form submission
   */
  @Output() onsubmit = new EventEmitter<UserCredentials>();

  /**
   * Form group for the login form
   */
  form: FormGroup | null = null;

  /**
   * Flag to indicate if the form has been submitted
   */
  submitted = false;

  /**
   * Constructor for LoginFormComponent.
   * 
   * @param formBuilder FormBuilder for creating form groups and controls.
   */
  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(12)]]
    });
  }

  /**
   * Angular lifecycle hook called on component initialization
   */
  ngOnInit() {}

  /**
   * Handles the form submission
   */
  onSubmit() {
    this.submitted = true;
    if (this.form?.valid) {
      this.onsubmit.emit(this.form?.value);
    }
  }
}
