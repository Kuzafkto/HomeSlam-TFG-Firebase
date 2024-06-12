import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/api/auth.service';
import { ModalController } from '@ionic/angular';
import { ErrorModalComponent } from 'src/app/shared/components/error-modal/error-modal.component';

/**
 * Guard to protect routes based on user ownership.
 */
@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {
  /**
   * Creates an instance of OwnerGuard.
   * 
   * @param auth Service to handle authentication state.
   * @param modalController Controller to handle modals.
   */
  constructor(
    private auth: AuthService,
    private modalController: ModalController
  ) {}

  /**
   * Determines whether a route can be activated based on user ownership.
   * 
   * @param route The activated route snapshot.
   * @param state The router state snapshot.
   * @returns Observable that resolves to a boolean.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.isOwner$.pipe(
      switchMap(async isOwner => {
        if (isOwner) {
          return true;
        } else {
          const modal = await this.modalController.create({
            component: ErrorModalComponent,
            cssClass: 'small-modal',
          });
          await modal.present();
          return false;
        }
      })
    );
  }
}
