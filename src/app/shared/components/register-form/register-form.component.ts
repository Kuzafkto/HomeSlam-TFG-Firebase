import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRegisterInfo } from '../../../core/interfaces/user-register-info';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent  implements OnInit {
  @Output() onsubmit = new EventEmitter<UserRegisterInfo>();
  form:FormGroup|null = null;
  constructor(
    private formBuilder:FormBuilder
  ) { 
    this.form = this.formBuilder.group({
      email:['', [Validators.required,Validators.email]],
      name:['', [Validators.required,Validators.minLength(2)]],
      password:['', [Validators.required,Validators.minLength(12)]],
      nickname:['', [Validators.required,Validators.minLength(2)]]
    });
  }
  ngOnInit() {}

  onSubmit(){
    this.onsubmit.emit(this.form?.value);
    this.form?.controls['password'].setValue('');
  }
}
