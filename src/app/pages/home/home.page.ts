import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { from, tap, zip } from 'rxjs';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { PlayersService } from 'src/app/core/services/api/player.service';
import { Player } from 'src/app/core/interfaces/player';
import { PlayerDetailComponent } from 'src/app/shared/components/player-detail/player-detail.component';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { AuthStrapiService } from 'src/app/core/services/api/strapi/auth-strapi.service';
import { HttpClientProvider } from 'src/app/core/services/http/http-client.provider';
import { UsersService } from 'src/app/core/services/api/users.service';
import { User } from 'src/app/core/interfaces/user';
import { FirebaseService } from 'src/app/core/services/firebase/firebase.service';
import { TeamService } from 'src/app/core/services/api/team.service';
import { Team } from 'src/app/core/interfaces/team';
import { Haptics, ImpactStyle } from '@capacitor/haptics';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  public loading: boolean = false;
  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClientProvider,
    private users: UsersService,
    private firebase:FirebaseService,
    private players:PlayersService,
    private teams:TeamService
  ) {
  }
  userUrl = ""
  ngOnInit(): void {
    this.loading = true;
    this.http.get("https://api.github.com/search/users?q=Kuzafkto+in%3Ausername", null, null).subscribe((result: any) => {
      this.userUrl = result.items[0].avatar_url;
    });
  }
  public goToPlayers() {
    this.router.navigate(['/players']);
  }
  public goToAbout() {
    this.router.navigate(['/about']);
  }
  public goToTeams() {
    this.router.navigate(['/teams']);
  }
  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  async activateVibrationWithOptions() {
    try {
      const options = {
        duration: 3000, // Duración de la vibración en milisegundos
        intensity: 1.0 // Intensidad de la vibración, un valor entre 0.1 y 1.0
      };
  
      await Haptics.vibrate(options);
      console.log('Vibración activada con éxito con opciones personalizadas');
    } catch (error) {
      console.error('Error al activar la vibración:', error);
    }
  }
}
