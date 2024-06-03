import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamesPageRoutingModule } from './games-routing.module';

import { GamesPage } from './games.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    GamesPageRoutingModule
  ],
  declarations: [GamesPage]
})
export class GamesPageModule {}
