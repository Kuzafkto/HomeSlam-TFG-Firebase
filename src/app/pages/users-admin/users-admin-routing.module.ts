import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersAdminPage } from './users-admin.page';

const routes: Routes = [
  {
    path: '',
    component: UsersAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersAdminPageRoutingModule {}
