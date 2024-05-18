import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { delay, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    of('').pipe(delay(2000)).subscribe(() => {
      //chequea el islogged
      this.authService.isLogged$.pipe(
        switchMap(logged => {
          // si no autentica redirige a inicio o a la que se paso 
          if (logged) {
            const redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || '/home';
            return this.router.navigateByUrl(redirectUrl);
          } else {
            return this.router.navigate(['/login']);
          }
        })
      ).subscribe();
    });
  }

}
