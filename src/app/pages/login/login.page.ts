import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserCredentials } from 'src/app/core/interfaces/user-credentials';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { Haptics } from '@capacitor/haptics';

/**
 * Component for handling user login.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  
  /**
   * Error message to display on the login page.
   */
  errorMessage: string | null = null;

  /**
   * Constructor for LoginPage component.
   *
   * @param auth - AuthService for handling authentication.
   * @param router - Router for navigating between routes.
   * @param route - ActivatedRoute for accessing route parameters.
   * @param toastController - ToastController for displaying toast notifications.
   */
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   * Subscribes to query parameters to set the error message.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || null;
    });
  }

  /**
   * Activates vibration with custom options using the Capacitor Haptics API.
   */
  async activateVibrationWithOptions() {
    try {
      const options = {
        duration: 300,
        intensity: 0.5
      };
      await Haptics.notification();
      console.log('Vibration activated successfully with custom options');
    } catch (error) {
      console.error('Error activating vibration:', error);
    }
  }

  /**
   * Displays a toast notification with the specified message.
   *
   * @param message - The message to display in the toast notification.
   */
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  /**
   * Handles user login by calling the AuthService login method with the provided credentials.
   *
   * @param credentials - The user's login credentials.
   */
  onLogin(credentials: UserCredentials) {
    this.auth.login(credentials).subscribe({
      next: data => {
        this.router.navigate(['/home']);
        console.log(data);
      },
      error: err => {
        console.log(err);
        this.showToast('Login failed. Please try again.');
      }
    });
  }

  /**
   * Navigates to the registration page.
   */
  goToRegisterPage() {
    this.router.navigate(['/register']);
  }
}
