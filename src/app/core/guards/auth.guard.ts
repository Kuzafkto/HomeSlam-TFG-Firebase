import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    //let redirectUrl = state.url; 
    let redirectUrl=route.url.reduce((p,v)=>p+v.path+'',"/");
    return this.auth.isLogged$.pipe(
      map(logged => {
        if (logged) {
          return true;
        } else {
          // si no autenticad redirigir al splash
          return this.router.createUrlTree(['/splash'], { queryParams: { redirectUrl } });
        }
      })
    );
  }
}
