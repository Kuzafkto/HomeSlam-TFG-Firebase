import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UsersService } from 'src/app/core/services/api/users.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  @Input() user: User | null = null;
  defaultPictureUrl: string = '';
  constructor(private userService: UsersService) {}

  ngOnInit(): void {}

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
