import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { BehaviorSubject, Observable, from, map, switchMap, of } from 'rxjs';
import { Player } from '../../interfaces/player';
import { User } from '../../interfaces/user';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';
import { FirebaseAuthService } from './firebase/firebase-auth.service';

export class playerNotFoundException extends Error {
  // . declare any additional properties or methods .
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  uploadImage(file: any) {
    throw new Error('Method not implemented.');
  }

  private _players: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public players$: Observable<Player[]> = this._players.asObservable();
  private unsubscribe: Unsubscribe | null = null;

  constructor(
    private firebaseSvc: FirebaseService,
    private firebaseAuth: FirebaseAuthService
  ) {
    this.mapPlayers = this.mapPlayers.bind(this);
    this.players$ = this.firebaseSvc.players$;
  }

  mapPlayers(doc: FirebaseDocument): Player {
    console.log(this.firebaseSvc.user?.uid);
    this.firebaseAuth.user$.subscribe(user => {
      console.log(user);
    });

    this.firebaseAuth.me().subscribe(user => {
      if (user.players.includes(doc.id)) {
        console.log("incluye " + doc.data['name']);
      }
    });

    // Mapeo de doc a Player
    return {
      name: doc.data['name'],
      positions: doc.data['positions'],
      imageUrl: doc.data['imageUrl'],  // Nuevo campo
      uuid: doc.id
    };
  }


  public addPlayer(player: Player): Observable<Player> {
    return from(this.firebaseSvc.createDocument("players", player)).pipe(
      map(() => player) // devolver el jugador creado después de la creación del documento
    );
  }
  

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

  public getPlayer(uuid: string): Observable<Player> {
    return from(this.firebaseSvc.getDocument("players", uuid)).pipe(switchMap((doc: FirebaseDocument) => {
      return new Observable<Player>(player => {
        let payload: Player = {
          uuid: doc.id,
          name: doc.data['name'],
          positions: doc.data['positions'],
          imageUrl: doc.data['imageUrl']  // Nuevo campo
        };
        player.next(payload);
      });
    }));
  }

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
        switchMap((user: User) => {
          if (!user || !user.uuid || !user.players || user.players.length === 0) {
            return new Observable<Player>(obs => {
              obs.error(new Error('User is incomplete'));
            });
          }

          user.players = user.players.filter(uuid => uuid !== player.uuid);
          return from(this.firebaseSvc.updateDocument("users", user, user.uuid));
        })
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
