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
@Injectable({
  providedIn: 'root'
})
export class AuthStrapiService extends AuthService{
  override update(extended: { data: any; }): any {
  }

  constructor(
    private jwtSvc:JwtService,
    private apiSvc:ApiService
    
  ) { 
    super();
    this.jwtSvc.loadToken().subscribe(token=>{
      if(token){
        this.me().subscribe(user=>{
          this._logged.next(true);
          this._user.next(user);
        })
      }else{
        this._logged.next(false);
        this._user.next(null);
      }
    });
  }

 
  public login(credentials:UserCredentials):Observable<User>{
    return new Observable<User>(obs=>{
      const _credentials:StrapiLoginPayload = {
        identifier:credentials.username,
        password:credentials.password
      };
      this.apiSvc.post("/auth/local", _credentials).subscribe({
        next:async (data:StrapiLoginResponse)=>{
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
        error:err=>{
          obs.error(err);
        }
      });
    });
  }

  logout():Observable<void>{
    return this.jwtSvc.destroyToken().pipe(map(_=>{
      this._logged.next(false);
      return;
    }));
  }

  register(info:UserRegisterInfo):Observable<User>{
    return new Observable<User>(obs=>{
      const _info:StrapiRegisterPayload = {
        email:info.email,
        username:info.nickname,
        password:info.password
      }
      this.apiSvc.post("/auth/local/register", _info).subscribe({
        next:async (data:StrapiRegisterResponse)=>{
          
          await lastValueFrom(this.jwtSvc.saveToken(data.jwt));
          const _extended_user:StrapiExtendedUser= {
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
          }
          try {
            await lastValueFrom(this.apiSvc.post("/extended-users", {data:_extended_user}));
            const user = await lastValueFrom(this.me());
            this._user.next(user);
            this._logged.next(true);
            obs.next(user);
            obs.complete();  
          } catch (error) {
            obs.error(error);
          }
          
        },
        error:err=>{
          obs.error(err);
        }
      });
    });
  }

  public me(): Observable<any> {
    //obtiene el users me ,lo encadenamos con un pipe y hacemos un switchmap para mapear el valor del observable obteniendo el extended que también mapearemos
    return this.apiSvc.get('/users/me').pipe(
      switchMap((user: StrapiUser) => {
        // Realiza la segunda llamada a la api y le hacemos un pipe, dentro un Map
        return this.apiSvc.get(`/extended-users?filters[users_permissions_user]=${user.id}&populate=players&populate=teams&populate=trainers`).pipe(
          map(extended_user_response => {
            //para simplificar el mapeo creamos extended_user que es el contenido dentro de la posicion 0 del array response.data
            let extended_user = extended_user_response.data[0];
            //ahora para cada tipo de valor que tiene el extended user que está contenido dentro de un array (players,teams, y trainers) hacemos un condicional en el que si existe lo mapeamos con su id, de lo contrario tenemos un array vacio

            //lo hacemos con players
            let players = extended_user.attributes.players ? extended_user.attributes.players.data.map((p: any) => p.id) : [];
            //teams
            let teams = extended_user.attributes.teams ? extended_user.attributes.teams.data.map((t: any) => t.id) : [];
            //y trainers
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
            //devolvemos el objeto con toda la informacion combinada
            return ret;
          })
        );
      }),
    );
  }
}