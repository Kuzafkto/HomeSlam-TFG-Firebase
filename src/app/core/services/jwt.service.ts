import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export type JwtToken = string;

/**
 * Service for managing JWT tokens. Provides methods to load, retrieve, save, and destroy JWT tokens.
 */
@Injectable({ providedIn: 'root' })
export class JwtService {

  token: string = "";

  constructor() {}

  /**
   * Loads the JWT token from storage.
   * 
   * @returns Observable emitting the loaded JWT token.
   */
  loadToken(): Observable<JwtToken> {
    return new Observable<JwtToken>(observer => {
      Preferences.get({ key: 'jwtToken' }).then((ret: any) => {
        if (ret['value']) {
          this.token = JSON.parse(ret.value);
          if (this.token == '' || this.token == null) {
            observer.next('');
          } else {
            observer.next(this.token);
          }
          observer.complete();
        } else {
          observer.next('');
          observer.complete();
        }
      }).catch((error: any) => observer.next(error));
    });
  }

  /**
   * Retrieves the current JWT token.
   * 
   * @returns The current JWT token.
   */
  getToken(): JwtToken {
    return this.token;
  }

  /**
   * Saves the JWT token to storage.
   * 
   * @param token The JWT token to save.
   * @returns Observable emitting the saved JWT token.
   */
  saveToken(token: JwtToken): Observable<JwtToken> {
    return new Observable<JwtToken>(observer => {
      Preferences.set({
        key: 'jwtToken',
        value: JSON.stringify(token)
      }).then((_) => {
        this.token = token;
        observer.next(this.token);
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    });
  }

  /**
   * Destroys the JWT token, removing it from storage.
   * 
   * @returns Observable emitting the destroyed JWT token.
   */
  destroyToken(): Observable<JwtToken> {
    this.token = "";
    localStorage.removeItem('CapacitorStorage.jwtToken');
    return this.saveToken(this.token);
  }
}
