import { Inject, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, from } from 'rxjs';
import { PaginatedUsers, User } from 'src/app/core/interfaces/user';
import { FirebaseService } from '../firebase/firebase.service';
import { DataService } from './data.service';
import { MappingService } from './mapping.service';



export class UserNotFoundException extends Error {
  // . declare any additional properties or methods .
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  //usamos directamente firebase
  constructor(
    private firebaseSvc: FirebaseService,
    private mapping: MappingService
  ) { }

  private _users: BehaviorSubject<PaginatedUsers> = new BehaviorSubject<PaginatedUsers>({ data: [], pagination: { page: 0, pageCount: 0, pageSize: 0, total: 0 } });
  public users$: Observable<PaginatedUsers> = this._users.asObservable();

  public addUser(user: User): Observable<any> {
      return from(this.firebaseSvc.createDocument("users", {
        name: user.name,
        surname: user.surname,
        nickname: user.nickname
      }));
    
  }


  public getAll(): Observable<any> {
    // Si coincide el tipo de datos que recibo con mi interfaz
    return from(this.firebaseSvc.getDocuments("users"));
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
      return from(this.firebaseSvc.deleteDocument("users", user.uuid))
    } else {
      throw new Error("User does not have uuid");
    }

  }
}