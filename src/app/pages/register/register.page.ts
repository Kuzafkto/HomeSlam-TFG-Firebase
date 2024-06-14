import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserRegisterInfo } from '../../core/interfaces/user-register-info';
import { AuthService } from '../../core/services/api/auth.service';

/**
 * Component for managing the user registration page.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  /**
   * Creates an instance of RegisterPage.
   * 
   * @param auth Service to manage authentication.
   * @param router Service to handle navigation.
   */
  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {
  }

  /**
   * Handles the user registration.
   * 
   * @param registerInfo The registration information provided by the user.
   */
  onRegister(registerInfo: UserRegisterInfo) {
    this.auth.register(registerInfo).subscribe({
      next: data => {
        // Registration successful
      },
      error: err => {
        console.log(err);
      }
    });
    this.router.navigate(['home']);
  }

  /**
   * Navigates to the login page.
   */
  goToLoginPage() {
    this.router.navigate(['/login']);
  }
}
