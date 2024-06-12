import { Observable, from, map } from 'rxjs';
import { UserCredentials } from '../../../interfaces/user-credentials';
import { UserRegisterInfo } from '../../../interfaces/user-register-info';
import { User } from '../../../interfaces/user';
import { AuthService } from '../auth.service';
import { FirebaseService, FirebaseUserCredential } from '../../firebase/firebase.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService extends AuthService {

  constructor(
    private firebaseSvc: FirebaseService
  ) { 
    super();

    // Suscribirse a isLogged$ y actualizar _logged y _user
    this.firebaseSvc.isLogged$.subscribe(logged => {
      if (logged) {
        this.me().subscribe({
          next: data => {
            this._user.next(data);
            this._logged.next(true);
            this.updateUserStatus(data);
          },
          error: err => {
            console.log(err);
          }
        });
      } else {
        this._logged.next(false);
        this._user.next(null);
        this._isAdmin.next(false);
        this._isOwner.next(false);
      }
    });
  }

  private updateUserStatus(user: User) {
    if (user) {
      this._isAdmin.next(user.isAdmin === true);
      this._isOwner.next(user.isOwner === true);
    } else {
      this._isAdmin.next(false);
      this._isOwner.next(false);
    }
  }

  public login(credentials: UserCredentials): Observable<any> {
    return new Observable<any>(subscr => {
      this.firebaseSvc.connectUserWithEmailAndPassword(credentials.username, credentials.password).then((credentials: FirebaseUserCredential | null) => {
        if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid) {
          subscr.error('Cannot login');
        }
        if (credentials) {
          this.me().subscribe(data => {
            this._user.next(data);
            this._logged.next(true);
            this.updateUserStatus(data);
            subscr.next(data);
            subscr.complete();
          });
        }
      });
    });
  }

  public register(info: UserRegisterInfo): Observable<any | null> {
    return new Observable<any>(subscr => {
      this.firebaseSvc.createUserWithEmailAndPassword(info.email, info.password).then((credentials: FirebaseUserCredential | null) => {
        if (!credentials || !credentials.user || !credentials.user.user || !credentials.user.user.uid)
          subscr.error('Cannot register');
        if (credentials) {
          var _info: User = {
            isAdmin: false,
            isOwner: false,
            ...info,
          };
          _info.uuid = this.firebaseSvc.user?.uid;
          this.postRegister(_info).subscribe(data => {
            this._user.next(_info);
            this._logged.next(true);
            this._isAdmin.next(false);
            this._isOwner.next(false);
            subscr.next(_info);
            subscr.complete();
          });
        }
      });
    });
  }

  private postRegister(info: User): Observable<any> {
    if (info.uuid)
      return from(this.firebaseSvc.createDocumentWithId('users', {
        name: info.name,
        nickname: info.nickname,
        email: info.email,
        votes: [],
        picture: info.picture ?? "",
        isAdmin: false,
        isOwner: false
      }, info.uuid));
    throw new Error('Unexpected error');
  }

  public me(): Observable<User> {
    if (this.firebaseSvc.user?.uid)
      return from(this.firebaseSvc.getDocument('users', this.firebaseSvc.user.uid)).pipe(map(data => {
        return {
          name: data.data['name'],
          email: data.data['email'],
          nickname: data.data['nickname'],
          players: data.data['players'],
          teams: data.data['teams'],
          picture: data.data['picture'] ?? "",
          uuid: data.id,
          isAdmin: data.data['isAdmin'],
          isOwner: data.data['isOwner']
        };
      }));
    else
      throw new Error('User is not connected');
  }

  public logout(): Observable<any> {
    return from(this.firebaseSvc.signOut(false));
  }
}
