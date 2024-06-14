import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/user';
import { UsersService } from 'src/app/core/services/api/users.service';

/**
 * Component for managing the users admin page.
 */
@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.page.html',
  styleUrls: ['./users-admin.page.scss'],
})
export class UsersAdminPage implements OnInit {

  /**
   * Indicates if the page is currently loading.
   */
  public loading: boolean = false;

  /**
   * Creates an instance of UsersAdminPage.
   * 
   * @param users Service to manage user data.
   * @param modal Controller to handle modal dialogs.
   * @param toast Controller to show toast notifications.
   */
  constructor(
    public users: UsersService,
    private modal: ModalController,
    private toast: ToastController
  ) { }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit(): void {
    this.loading = true;
    // Simulate loading process
    setTimeout(() => {
      this.loading = false;
    }, 1000); // Adjust the timeout as needed
  }
}
