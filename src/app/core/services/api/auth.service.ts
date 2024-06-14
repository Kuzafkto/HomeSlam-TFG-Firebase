import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserCredentials } from '../../interfaces/user-credentials';
import { UserRegisterInfo } from '../../interfaces/user-register-info';
import { JwtService } from '../jwt.service';
import { ApiService } from './api.service';
import { User } from '../../interfaces/user';

/**
 * This abstract service handles authentication operations. It should be extended by other services to implement specific authentication logic.
 */
@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {
  /**
   * Actualiza la información del usuario.
   * @param user Información del usuario a actualizar.
   * @returns Un Observable con el resultado de la actualización.
   */
  abstract updateUser(user: User): Observable<any>;

  /**
   * Updates user data.
   * @param extended The extended user data.
   */
  update(extended: { data: any; }): any {}

  /**
   * Subject to track the login status.
   */
  protected _logged = new BehaviorSubject<boolean|null>(null);

  /**
   * Observable for the login status.
   */
  public isLogged$ = this._logged.asObservable();

  /**
   * Subject to track if the user is an admin.
   */
  protected _isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Observable for the admin status.
   */
  public isAdmin$: Observable<boolean> = this._isAdmin.asObservable();

  /**
   * Subject to track if the user is an owner.
   */
  protected _isOwner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Observable for the owner status.
   */
  public isOwner$: Observable<boolean> = this._isOwner.asObservable();

  /**
   * Subject to track the current user.
   */
  protected _user = new BehaviorSubject<User|null>(null);

  /**
   * Observable for the current user.
   */
  public user$ = this._user.asObservable();
  
  /**
   * Logs in a user with the given credentials.
   * @param credentials The user's login credentials.
   * @returns An observable of the logged-in user.
   */
  public abstract login(credentials: Object): Observable<User>;

  /**
   * Registers a new user with the given information.
   * @param info The user's registration information.
   * @returns An observable of the registered user.
   */
  public abstract register(info: Object): Observable<User>;

  /**
   * Logs out the current user.
   * @returns An observable of the logout operation.
   */
  public abstract logout(): Observable<void>;

  /**
   * Retrieves the current user's information.
   * @returns An observable of the current user.
   */
  public abstract me(): Observable<any>;
}
