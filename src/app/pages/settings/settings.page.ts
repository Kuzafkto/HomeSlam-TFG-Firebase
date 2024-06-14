import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { User } from 'src/app/core/interfaces/user';
import { ToastController } from '@ionic/angular';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';
import { MediaService } from 'src/app/core/services/api/media.service';
import { dataURLtoBlob } from 'src/app/core/helpers/blob';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  
  /**
   * Array of available languages.
   */
  languages = ['es', 'en'];

  /**
   * Currently selected language.
   */
  languageSelected = 'es';

  /**
   * Form group for user settings.
   */
  userForm: FormGroup;

  /**
   * Current user details.
   */
  user: User | null = null;

  /**
   * Constructor for SettingsPage component.
   *
   * @param translateService - Service for handling translations.
   * @param authService - Service for handling authentication and user details.
   * @param fb - FormBuilder for creating reactive forms.
   * @param toastController - Controller for displaying toast notifications.
   * @param firebaseService - Service for handling Firebase operations.
   * @param mediaService - Service for handling media uploads.
   */
  constructor(
    private translateService: CustomTranslateService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastController: ToastController,
    private firebaseService: FirebaseService,
    private mediaService: MediaService
  ) {
    this.languageSelected = this.translateService.getLang();
    this.userForm = this.fb.group({
      nickname: ['', Validators.required],
      picture: ['']
    });
  }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   * Fetches the current user details and initializes the form.
   */
  ngOnInit() {
    this.authService.me().subscribe(user => {
      this.user = user;
      this.userForm.patchValue({
        nickname: user.nickname,
        picture: user.picture
      });
    });
  }

  /**
   * Sets the application language and displays a toast notification.
   *
   * @param lang - The language code to set.
   */
  setLanguage(lang: string) {
    this.languageSelected = lang;
    this.translateService.onLanguageChange(lang);
    this.showToast(`Language changed to ${lang.toUpperCase()}`);
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
      position: 'bottom'
    });
    toast.present();
  }

  /**
   * Updates the user details.
   * If the picture is changed, it uploads the new picture and updates the user details accordingly.
   */
  updateUser() {
    if (this.userForm.valid) {
      const updatedUser = { ...this.user, ...this.userForm.value };
      if (updatedUser.picture !== this.user?.picture) {
        dataURLtoBlob(updatedUser.picture, (blob: Blob) => {
          this.mediaService.upload(blob).subscribe((media: any[]) => {
            updatedUser.picture = media[0].url_medium;
            this.authService.updateUser(updatedUser).subscribe(async () => {
              this.showToast('User information updated successfully');
            });
          }, error => {
            console.error('Error uploading image:', error);
            this.showToast('Error uploading image');
          });
        });
      } else {
        this.authService.updateUser(updatedUser).subscribe(async () => {
          this.showToast('User information updated successfully');
        });
      }
    }
  }

  /**
   * Checks if the form is dirty (modified).
   *
   * @returns True if the form is dirty, false otherwise.
   */
  get isFormDirty(): boolean {
    return this.userForm.get('nickname')?.value !== this.user?.nickname || this.userForm.get('picture')?.value !== this.user?.picture;
  }
}
