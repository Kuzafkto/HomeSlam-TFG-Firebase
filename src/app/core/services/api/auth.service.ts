import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { UserCredentials } from '../../interfaces/user-credentials';
import { UserRegisterInfo } from '../../interfaces/user-register-info';
import { JwtService } from '../jwt.service';
import { ApiService } from './api.service';
import { User } from '../../interfaces/user';



@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {
  update(extended: { data: any; }): any {
  }

  protected _logged = new BehaviorSubject<boolean|null>(null);
  public isLogged$ = this._logged.asObservable();
  protected _isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this._isAdmin.asObservable();
  protected _isOwner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isOwner$: Observable<boolean> = this._isOwner.asObservable();
  protected _user = new BehaviorSubject<User|null>(null);
  public user$ = this._user.asObservable();
  
  public abstract login(credentials:Object):Observable<User>;

  public abstract register(info:Object):Observable<User>;

  public abstract logout():Observable<void>;

  public abstract me():Observable<any>;
}