import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { BehaviorSubject, Observable, from, map, switchMap, of } from 'rxjs';
import { Player } from '../../interfaces/player';
import { User } from '../../interfaces/user';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';
import { FirebaseAuthService } from './firebase/firebase-auth.service';

/**
 * Exception thrown when a player is not found.
 */
export class playerNotFoundException extends Error {
  // . declare any additional properties or methods .
}

/**
 * This service handles operations related to players.
 */
@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  uploadImage(file: any) {
    throw new Error('Method not implemented.');
  }

  /**
   * BehaviorSubject to track the list of players.
   */
  private _players: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

  /**
   * Observable for the list of players.
   */
  public players$: Observable<Player[]> = this._players.asObservable();

  /**
   * Unsubscribe function for Firebase listeners.
   */
  private unsubscribe: Unsubscribe | null = null;

  /**
   * Creates an instance of PlayersService.
   * 
   * @param firebaseSvc Service to interact with Firebase.
   * @param firebaseAuth Service to handle Firebase authentication.
   */
  constructor(
    private firebaseSvc: FirebaseService,
    private firebaseAuth: FirebaseAuthService
  ) {
    this.mapPlayers = this.mapPlayers.bind(this);
    this.players$ = this.firebaseSvc.players$;
  }

  /**
   * Maps a Firebase document to a Player object.
   * 
   * @param doc The Firebase document.
   * @returns The mapped Player object.
   */
  mapPlayers(doc: FirebaseDocument): Player {
    console.log(this.firebaseSvc.user?.uid);
    this.firebaseAuth.user$.subscribe(user => {
      console.log(user);
    });

    return {
      name: doc.data['name'],
      positions: doc.data['positions'],
      imageUrl: doc.data['imageUrl'],
      uuid: doc.id
    };
  }

  /**
   * Adds a new player.
   * 
   * @param player The player to add.
   * @returns An observable of the added player.
   */
  public addPlayer(player: Player): Observable<Player> {
    return from(this.firebaseSvc.createDocument("players", player)).pipe(
      map(() => player) // Return the created player after document creation
    );
  }

  /**
   * Retrieves all players.
   * 
   * @returns An observable of the list of players.
   */
  public getAll(): Observable<Player[]> {
    return from(this.firebaseSvc.getDocuments("players")).pipe(
      map((documents: FirebaseDocument[]) => {
        const players: Player[] = documents.map(doc => {
          return {
            uuid: doc.id,
            id: doc.data['id'],
            name: doc.data['name'],
            positions: doc.data['positions'],
            imageUrl: doc.data['imageUrl']
          } as Player;
        });
        this._players.next(players);
        return players;
      })
    );
  }

  /**
   * Retrieves a player by their UUID.
   * 
   * @param uuid The UUID of the player.
   * @returns An observable of the player.
   */
  public getPlayer(uuid: string): Observable<Player> {
    return from(this.firebaseSvc.getDocument("players", uuid)).pipe(switchMap((doc: FirebaseDocument) => {
      return new Observable<Player>(player => {
        let payload: Player = {
          uuid: doc.id,
          name: doc.data['name'],
          positions: doc.data['positions'],
          imageUrl: doc.data['imageUrl']
        };
        player.next(payload);
      });
    }));
  }

  /**
   * Updates an existing player.
   * 
   * @param player The player to update.
   * @returns An observable of the updated player.
   */
  public updatePlayer(player: Player): Observable<Player> {
    return new Observable<Player>(obs => {
      if (player.uuid) {
        this.firebaseSvc.updateDocument("players", player, player.uuid);
        obs.next(player);
      } else {
        obs.error(new Error("Player does not have UUID"));
      }
    });
  }

  /**
   * Deletes a player.
   * 
   * @param player The player to delete.
   * @returns An observable of the deleted player.
   */
  public deletePlayer(player: Player): Observable<Player> {
    return new Observable<Player>(obs => {
      if (!player.uuid) {
        obs.error(new Error("Player does not have UUID"));
        return;
      }

      from(this.firebaseSvc.deleteDocument("players", player.uuid)).pipe(
        switchMap(() => {
          return this.firebaseAuth.me();
        }),
      ).subscribe({
        next: () => {
          obs.next(player);
          obs.complete();
        },
        error: error => {
          obs.error(error);
        }
      });
    });
  }

  /**
   * Deletes all players.
   * 
   * @returns An observable of the delete operation.
   */
  public deleteAll(): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        this._players.next([]);
        observer.next();
        observer.complete();
      }, 1000);
    });
  }
}
