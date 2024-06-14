import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, map, tap, switchMap } from 'rxjs';
import { UserCredentials } from '../../../interfaces/user-credentials';
import { UserRegisterInfo } from '../../../interfaces/user-register-info';
import { JwtService } from '../../jwt.service';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { StrapiArrayResponse, StrapiExtendedUser, StrapiLoginPayload, StrapiLoginResponse, StrapiMe, StrapiRegisterPayload, StrapiRegisterResponse, StrapiResponse, StrapiUser } from '../../../interfaces/strapi';
import { User } from '../../../interfaces/user';
import { Router } from '@angular/router';

/**
 * This service handles authentication using Strapi. Note that this service is not currently being utilized.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStrapiService extends AuthService {
  updateUser(user: User): Observable<any> {
    throw new Error('Method not implemented.');
  }
  override update(extended: { data: any; }): any {
  }

  /**
   * Creates an instance of AuthStrapiService.
   * 
   * @param jwtSvc Service to handle JWT tokens.
   * @param apiSvc Service to make API requests.
   */
  constructor(
    private jwtSvc: JwtService,
    private apiSvc: ApiService
  ) { 
    super();
    this.jwtSvc.loadToken().subscribe(token => {
      if (token) {
        this.me().subscribe(user => {
          this._logged.next(true);
          this._user.next(user);
        });
      } else {
        this._logged.next(false);
        this._user.next(null);
      }
    });
  }

  /**
   * Logs in a user with the provided credentials.
   * 
   * @param credentials The user's login credentials.
   * @returns An observable of the logged-in user.
   */
  public login(credentials: UserCredentials): Observable<User> {
    return new Observable<User>(obs => {
      const _credentials: StrapiLoginPayload = {
        identifier: credentials.username,
        password: credentials.password
      };
      this.apiSvc.post("/auth/local", _credentials).subscribe({
        next: async (data: StrapiLoginResponse) => {
          await lastValueFrom(this.jwtSvc.saveToken(data.jwt));
          try {
            const user = await lastValueFrom(this.me());
            this._user.next(user);
            this._logged.next(true);
            obs.next(user);
            obs.complete();
          } catch (error) {
            obs.error(error);
          }
        },
        error: err => {
          obs.error(err);
        }
      });
    });
  }

  /**
   * Logs out the current user.
   * 
   * @returns An observable of the logout result.
   */
  logout(): Observable<void> {
    return this.jwtSvc.destroyToken().pipe(map(_ => {
      this._logged.next(false);
      return;
    }));
  }

  /**
   * Registers a new user with the provided information.
   * 
   * @param info The user's registration information.
   * @returns An observable of the registered user.
   */
  register(info: UserRegisterInfo): Observable<User> {
    return new Observable<User>(obs => {
      const _info: StrapiRegisterPayload = {
        email: info.email,
        username: info.nickname,
        password: info.password
      };
      this.apiSvc.post("/auth/local/register", _info).subscribe({
        next: async (data: StrapiRegisterResponse) => {
          await lastValueFrom(this.jwtSvc.saveToken(data.jwt));
          const _extended_user: StrapiExtendedUser = {
            name: info.name,
            surname: info.surname,
            user_id: data.user.id,
            data: {
              name: '',
              surname: '',
              users_permissions_user: 0,
              players: [],
              teams: [],
              trainers: []
            }
          };
          try {
            await lastValueFrom(this.apiSvc.post("/extended-users", { data: _extended_user }));
            const user = await lastValueFrom(this.me());
            this._user.next(user);
            this._logged.next(true);
            obs.next(user);
            obs.complete();  
          } catch (error) {
            obs.error(error);
          }
        },
        error: err => {
          obs.error(err);
        }
      });
    });
  }

  /**
   * Retrieves the current user's information.
   * 
   * @returns An observable of the current user's information.
   */
  public me(): Observable<any> {
    // Obtiene el usuario y lo encadena con un pipe y hace un switchMap para mapear el valor del observable obteniendo el extended user que también mapearemos
    return this.apiSvc.get('/users/me').pipe(
      switchMap((user: StrapiUser) => {
        // Realiza la segunda llamada a la API y le hacemos un pipe, dentro un map
        return this.apiSvc.get(`/extended-users?filters[users_permissions_user]=${user.id}&populate=players&populate=teams&populate=trainers`).pipe(
          map(extended_user_response => {
            // Para simplificar el mapeo, creamos extended_user que es el contenido dentro de la posición 0 del array response.data
            let extended_user = extended_user_response.data[0];
            // Mapeamos los arrays de players, teams y trainers
            let players = extended_user.attributes.players ? extended_user.attributes.players.data.map((p: any) => p.id) : [];
            let teams = extended_user.attributes.teams ? extended_user.attributes.teams.data.map((t: any) => t.id) : [];
            let trainers = extended_user.attributes.trainers ? extended_user.attributes.trainers.data.map((t: any) => t.id) : [];

            // Construye el objeto 'ret' con la información combinada
            let ret: any = {
              id: extended_user.id,
              name: extended_user.attributes.name,
              surname: extended_user.attributes.surname,
              username: user.username,
              users_permissions_user: user.id,
              email: user.email,
              players: players,
              teams: teams,
              trainers: trainers
            };
            // Devuelve el objeto con toda la información combinada
            return ret;
          })
        );
      }),
    );
  }
}
