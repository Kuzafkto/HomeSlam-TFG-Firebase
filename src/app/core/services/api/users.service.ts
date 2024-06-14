import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { PaginatedUsers, User } from 'src/app/core/interfaces/user';
import { FirebaseService } from '../firebase/firebase.service';
import { map } from 'rxjs/operators';

/**
 * This service handles operations related to users.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  /**
   * BehaviorSubject to track the list of users.
   */
  private _users: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  /**
   * Observable for the list of users.
   */
  public users$: Observable<User[]> = this._users.asObservable();

  /**
   * Creates an instance of UsersService.
   * 
   * @param firebaseSvc Service to interact with Firebase.
   */
  constructor(
    private firebaseSvc: FirebaseService
  ) {
    this.users$ = this.firebaseSvc.users$;
  }

  /**
   * Adds a new user.
   * 
   * @param user The user to add.
   * @returns An observable of the add operation.
   */
  public addUser(user: User): Observable<any> {
    return from(this.firebaseSvc.createDocument("users", {
      name: user.name,
      nickname: user.nickname
    }));
  }

  /**
   * Retrieves all users.
   * 
   * @returns An observable of the list of users.
   */
  public getAll(): Observable<any> {
    return this.users$;
  }

  /**
   * Retrieves a user by their UUID.
   * 
   * @param uuid The UUID of the user.
   * @returns An observable of the user.
   */
  public getUser(uuid: string): Observable<any> {
    return from(this.firebaseSvc.getDocument("users", uuid));
  }

  /**
   * Updates an existing user.
   * 
   * @param user The user to update.
   * @returns An observable of the update operation.
   */
  public updateUser(user: User): Observable<any> {
    if (user.uuid) {
      return from(this.firebaseSvc.updateDocument("users", user, user.uuid));
    } else {
      throw new Error("User does not have UUID");
    }
  }

  /**
   * Deletes a user.
   * 
   * @param user The user to delete.
   * @returns An observable of the delete operation.
   */
  public deleteUser(user: User): Observable<any> {
    if (user.uuid) {
      return from(this.firebaseSvc.deleteDocument("users", user.uuid));
    } else {
      throw new Error("User does not have UUID");
    }
  }
}
