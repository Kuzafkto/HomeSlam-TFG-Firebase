import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';
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

/**
 * Component for managing the home page.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  /**
   * Indicates if the page is currently loading.
   */
  public loading: boolean = false;

  /**
   * URL of the user's avatar.
   */
  userUrl = "";

  /**
   * Creates an instance of HomePage.
   * 
   * @param auth Service to manage authentication.
   * @param router Service to handle navigation.
   * @param http Service to handle HTTP requests.
   * @param users Service to manage user data.
   * @param firebase Service to manage Firebase operations.
   * @param players Service to manage player data.
   * @param teams Service to manage team data.
   */
  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClientProvider,
    private users: UsersService,
    private firebase: FirebaseService,
    private players: PlayersService,
    private teams: TeamService
  ) {}

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit(): void {
    this.loading = true;
    this.http.get("https://api.github.com/search/users?q=Kuzafkto+in%3Ausername", null, null).subscribe((result: any) => {
      this.userUrl = result.items[0].avatar_url;
    });
  }

  /**
   * Navigates to the players page.
   */
  public goToPlayers() {
    this.router.navigate(['/players']);
  }

  /**
   * Navigates to the games page.
   */
    goToGames() {
    this.router.navigate(['/games']);
  }

  /**
   * Navigates to the teams page.
   */
  public goToTeams() {
    this.router.navigate(['/teams']);
  }

 
  /**
   * Logs out the current user and navigates to the login page.
   */
  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Activates vibration with custom options.
   */
  async activateVibrationWithOptions() {
    try {
      const options = {
        duration: 3000, // Duration of the vibration in milliseconds
        intensity: 1.0 // Intensity of the vibration, a value between 0.1 and 1.0
      };

      await Haptics.vibrate(options);
      console.log('Vibration activated successfully with custom options');
    } catch (error) {
      console.error('Error activating vibration:', error);
    }
  }
}
