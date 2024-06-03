import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, map, Observable, switchMap, throwError } from 'rxjs';
import { Game } from '../../interfaces/game';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';
import { TeamService } from './team.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _games: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);
  public games$: Observable<Game[]> = this._games.asObservable();

  constructor(
    private firebaseSvc: FirebaseService,
    private teamsService: TeamService // Para obtener detalles de los equipos
  ) {
    this.games$=this.firebaseSvc.games$;
  }

  public getGame(uuid: string): Observable<Game> {
    return from(this.firebaseSvc.getDocument("games", uuid)).pipe(
      switchMap((doc: FirebaseDocument) => {
        const localTeamUUID = doc.data['local'];
        const visitorTeamUUID = doc.data['visitor'];

        return this.teamsService.getTeam(localTeamUUID).pipe(
          switchMap(localTeam => {
            return this.teamsService.getTeam(visitorTeamUUID).pipe(
              map(visitorTeam => {
                const game: Game = {
                  uuid: doc.id,
                  gameDate: doc.data['gameDate'],
                  local: localTeam,
                  localRuns: doc.data['localRuns'],
                  story: doc.data['story'],
                  visitor: visitorTeam,
                  visitorRuns: doc.data['visitorRuns']
                };
                return game;
              })
            );
          })
        );
      })
    );
  }

  public getAll(): Observable<Game[]> {
    return from(this.firebaseSvc.getDocuments("games")).pipe(
      switchMap((gameDocuments: FirebaseDocument[]) => {
        const gameObservables = gameDocuments.map(doc => {
          return this.getGame(doc.id);
        });
        return combineLatest(gameObservables).pipe(
          map(games => {
            this._games.next(games);
            return games;
          })
        );
      })
    );
  }

  public addGame(game: Game): Observable<Game> {
    return from(this.firebaseSvc.createDocument("games", game)).pipe(
      map(createdDocId => {
        game.uuid = createdDocId;
        return game;
      })
    );
  }

  public updateGame(game: Game): Observable<void> {
    if (!game.uuid) {
      return throwError(new Error("Game does not have UUID"));
    }

    const gameData = { ...game };
    delete gameData.uuid; // Eliminar UUID para no sobrescribir en Firestore

    return from(this.firebaseSvc.updateDocument("games", gameData, game.uuid)).pipe(
      map(() => {
        const updatedGames = this._games.value.map(g => g.uuid === game.uuid ? game : g);
        this._games.next(updatedGames);
      })
    );
  }

  public deleteGame(game: Game): Observable<Game> {
    return new Observable<Game>(obs => {
      if (!game.uuid) {
        obs.error(new Error("Game does not have UUID"));
        return;
      }
  
      // Eliminar el juego de la colección "games"
      from(this.firebaseSvc.deleteDocument("games", game.uuid)).subscribe({
        next: () => {
          obs.next(game); // Devolver el juego eliminado en el observable
          obs.complete();
        },
        error: error => {
          obs.error(error); // Propagar cualquier error que ocurra durante el proceso
        }
      });
    });
  }
}
