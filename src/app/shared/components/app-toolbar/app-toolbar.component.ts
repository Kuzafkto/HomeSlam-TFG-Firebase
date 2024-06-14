import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CustomTranslateService } from 'src/app/core/services/custom-translate.service';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { BehaviorSubject, map } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.scss'],
})
export class AppToolbarComponent implements OnInit {
  /**
   * List of supported languages.
   */
  @Input() languages: string[] = ["es", "en"];

  /**
   * Currently selected language.
   */
  @Input() languageSelected: string = "es";

  /**
   * Event emitted when the signout action is triggered.
   */
  @Output() onSignout = new EventEmitter();

  /**
   * Event emitted when the profile action is triggered.
   */
  @Output() onProfile = new EventEmitter();

  /**
   * Event emitted when the language change action is triggered.
   */
  @Output() onLanguage = new EventEmitter();

  /**
   * BehaviorSubject to hold the username.
   */
  private _username = new BehaviorSubject<string>("Kuza Fkto");

  /**
   * Observable for the username.
   */
  username$ = this._username.asObservable();

  /**
   * Observable for the nickname, derived from the authenticated user.
   */
  nickname$ = this.auth.user$.pipe(map(user => user?.nickname));

  /**
   * Observable to check if the user is an owner.
   */
  isOwner$ = this.auth.isOwner$;

  /**
   * Flag to control toolbar visibility.
   */
  hidden = false;

  /**
   * Constructor for AppToolbarComponent.
   * 
   * @param router - Router for navigation.
   * @param auth - AuthService for authentication operations.
   * @param lang - CustomTranslateService for handling translations.
   */
  constructor(
    private router: Router,
    private auth: AuthService,
    private lang: CustomTranslateService
  ) {}

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   */
  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        if (currentUrl === '/login' || currentUrl === '/register') {
          this.hidden = true;
        } else {
          this.hidden = false;
          this.auth.me().subscribe((user) => {
            this._username.next(user.name);
          });
        }
      }
    });

    // Subscribe to language changes
    this.lang.languageChange$.subscribe((language) => {
      this.languageSelected = language;
    });
  }

  /**
   * Navigates to the players page.
   */
  public goToPlayers() {
    this.router.navigate(['/players']);
  }

  /**
   * Navigates to the about page.
   */
  public goToAbout() {
    this.router.navigate(['/about']);
  }

  /**
   * Navigates to the teams page.
   */
  public goToTeams() {
    this.router.navigate(['/teams']);
  }

  /**
   * Navigates to the games page.
   */
  public goToGames() {
    this.router.navigate(['/games']);
  }

  /**
   * Navigates to the settings page.
   */
  public goToSettings() {
    this.router.navigate(['/settings']);
  }

  /**
   * Logs out the current user and navigates to the login page.
   */
  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Navigates to the users admin page.
   */
  goToUsersAdmin() {
    this.router.navigate(['/users-admin']);
  }

  /**
   * Sets the application language.
   * 
   * @param lang - The new language to set.
   */
  setLanguage(lang: string) {
    this.languageSelected = lang;
    this.lang.onLanguageChange(lang);
  }
}
