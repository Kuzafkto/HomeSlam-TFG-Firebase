import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/api/auth.service';

/**
 * Guard to protect routes based on user authentication and authorization.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  /**
   * Creates an instance of AuthGuard.
   * 
   * @param auth Service to handle authentication state.
   * @param router Service to navigate or redirect routes.
   */
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /**
   * Determines whether a route can be activated based on user authentication and authorization.
   * 
   * @param route The activated route snapshot.
   * @param state The router state snapshot.
   * @returns Observable that resolves to a boolean or UrlTree.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    let redirectUrl = route.url.reduce((p, v) => p + v.path + '', "/");

    return combineLatest([
      this.auth.isLogged$,
      this.auth.isAdmin$
    ]).pipe(
      map(([isLogged, isAdmin]) => {
        if (isLogged && isAdmin) {
          return true;
        } else if (!isLogged) {
          // If not authenticated, redirect to splash page
          return this.router.createUrlTree(['/splash'], { queryParams: { redirectUrl } });
        } else {
          // If not an admin, redirect to login page with an error message
          return this.router.createUrlTree(['/login'], { queryParams: { error: 'You do not have admin access to this page' } });
        }
      })
    );
  }
}
