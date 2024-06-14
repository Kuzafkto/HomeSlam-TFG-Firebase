import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UsersService } from 'src/app/core/services/api/users.service';

/**
 * Component for displaying user information and managing admin status.
 */
@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {

  /**
   * The user object to display information for.
   */
  @Input() user: User | null = null;

  /**
   * The default picture URL to display if the user does not have a picture.
   */
  defaultPictureUrl: string = '../../../../assets/imgs/unknown.png';

  /**
   * Constructor for UserInfoComponent.
   *
   * @param userService - Injected UsersService for managing user data.
   */
  constructor(private userService: UsersService) {}

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit(): void {}

  /**
   * Handler for when the isAdmin status of the user is changed.
   * Updates the user's isAdmin status in the backend.
   * 
   * @param event The event containing the new isAdmin status.
   */
  onIsAdminChange(event: any) {
    if (this.user && this.user.uuid) {
      const isAdmin = event.detail.checked;
      this.userService.updateUser({ ...this.user, isAdmin }).subscribe(
        () => {
          console.log(`User ${this.user?.name} updated to isAdmin: ${isAdmin}`);
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    }
  }
}
