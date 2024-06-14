import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { delay, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Component for managing the splash page.
 */
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  /**
   * Creates an instance of SplashPage.
   * 
   * @param authService Service to manage authentication.
   * @param router Service to handle navigation.
   * @param route Service to handle route information.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /**
   * Angular lifecycle hook that is called after data-bound properties are initialized.
   * This method sets up a delay and then checks if the user is logged in to determine the next navigation route.
   */
  ngOnInit() {
    of('').pipe(delay(2000)).subscribe(() => {
      // Check if the user is logged in
      this.authService.isLogged$.pipe(
        switchMap(logged => {
          // If logged in, navigate to the home page or the specified redirect URL
          if (logged) {
            const redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || '/home';
            return this.router.navigateByUrl(redirectUrl);
          } else {
            // If not logged in, navigate to the login page
            return this.router.navigate(['/login']);
          }
        })
      ).subscribe();
    });
  }

}
