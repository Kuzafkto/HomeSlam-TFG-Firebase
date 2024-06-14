import { Observable, from, map, switchMap, tap } from 'rxjs';
import { UserCredentials } from '../../../interfaces/user-credentials';
import { UserRegisterInfo } from '../../../interfaces/user-register-info';
import { User } from '../../../interfaces/user';
import { AuthService } from '../auth.service';
import { FirebaseService, FirebaseUserCredential } from '../../firebase/firebase.service';
import { Injectable } from '@angular/core';
import { getAuth, updateEmail, updatePassword } from 'firebase/auth';

/**
 * Service to handle Firebase authentication.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService extends AuthService {

  /**
   * Creates an instance of FirebaseAuthService.
   * 
   * @param firebaseSvc Service to interact with Firebase.
   */
  constructor(
    private firebaseSvc: FirebaseService
  ) { 
    super();

    // Suscribe to isLogged$ and update _logged and _user
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

  /**
   * Updates the user's status based on their roles.
   * 
   * @param user The user whose status needs to be updated.
   */
  private updateUserStatus(user: User) {
    if (user) {
      this._isAdmin.next(user.isAdmin === true);
      this._isOwner.next(user.isOwner === true);
    } else {
      this._isAdmin.next(false);
      this._isOwner.next(false);
    }
  }

  /**
   * Logs in a user with the provided credentials.
   * 
   * @param credentials The user's login credentials.
   * @returns An observable of the login result.
   */
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

  /**
   * Registers a new user with the provided information.
   * 
   * @param info The information needed to register the user.
   * @returns An observable of the registration result.
   */
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

  /**
   * Creates a new document in the database with the user's registration information.
   * 
   * @param info The user's information to be saved in the database.
   * @returns An observable of the result.
   */
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

  /**
   * Retrieves the current user's information.
   * 
   * @returns An observable of the user's information.
   */
  public me(): Observable<User> {
    if (this.firebaseSvc.user?.uid)
      return from(this.firebaseSvc.getDocument('users', this.firebaseSvc.user.uid)).pipe(map(data => {
        return {
          name: data.data['name'],
          email: data.data['email'],
          nickname: data.data['nickname'],
          picture: data.data['picture'] ?? "",
          uuid: data.id,
          isAdmin: data.data['isAdmin'],
          isOwner: data.data['isOwner']
        };
      }));
    else
      throw new Error('User is not connected');
  }

  /**
   * Logs out the current user.
   * 
   * @returns An observable of the logout result.
   */
  public logout(): Observable<any> {
    return from(this.firebaseSvc.signOut(false));
  }

 /**
   * Updates the user's profile information.
   * 
   * @param user The user object containing updated information.
   * @returns An observable of the update result.
   */
 public updateUser(user: User): Observable<any> {
  if (user.uuid) {
    return from(this.firebaseSvc.updateDocument('users', {
      nickname: user.nickname,
      picture: user.picture
    }, user.uuid)).pipe(
      switchMap(() => this.me()), // Fetch the updated user information
      tap(updatedUser => this._user.next(updatedUser)) // Update the user observable
    );
  }
  throw new Error('Unexpected error');
}
}
