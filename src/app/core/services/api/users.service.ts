import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { PaginatedUsers, User } from 'src/app/core/interfaces/user';
import { FirebaseService } from '../firebase/firebase.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(
    private firebaseSvc: FirebaseService
  ) {
    this.users$=this.firebaseSvc.users$;
   }

  private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this._users.asObservable();

  public addUser(user: User): Observable<any> {
    return from(this.firebaseSvc.createDocument("users", {
      name: user.name,
      nickname: user.nickname
    }));
  }

  public getAll(): Observable<any> {
    return this.users$;
  }

  public getUser(uuid: string): Observable<any> {
    return from(this.firebaseSvc.getDocument("users", uuid));
  }

  public updateUser(user: User): Observable<any> {
    if (user.uuid) {
      return from(this.firebaseSvc.updateDocument("users", user, user.uuid));
    } else {
      throw new Error("user does not have UUID");
    }
  }

  public deleteUser(user: User): Observable<any> {
    if (user.uuid) {
      return from(this.firebaseSvc.deleteDocument("users", user.uuid));
    } else {
      throw new Error("User does not have uuid");
    }
  }

}
