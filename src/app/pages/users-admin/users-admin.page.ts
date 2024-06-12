import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/user';
import { UsersService } from 'src/app/core/services/api/users.service';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.page.html',
  styleUrls: ['./users-admin.page.scss'],
})
export class UsersAdminPage implements OnInit {

  public loading: boolean = false;

  constructor(
    public users: UsersService,
    private modal: ModalController,
    private toast: ToastController
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.loading = false;
  }
}
