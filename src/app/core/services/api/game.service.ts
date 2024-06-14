import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, map, Observable, switchMap, throwError } from 'rxjs';
import { Game } from '../../interfaces/game';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';
import { TeamService } from './team.service';

/**
 * This service handles operations related to games.
 */
@Injectable({
  providedIn: 'root'
})
export class GameService {

  /**
   * BehaviorSubject to track the list of games.
   */
  private _games: BehaviorSubject<Game[]> = new BehaviorSubject<Game[]>([]);

  /**
   * Observable for the list of games.
   */
  public games$: Observable<Game[]> = this._games.asObservable();

  /**
   * Creates an instance of GameService.
   * 
   * @param firebaseSvc Service to interact with Firebase.
   * @param teamsService Service to get details of the teams.
   */
  constructor(
    private firebaseSvc: FirebaseService,
    private teamsService: TeamService
  ) {
    this.games$ = this.firebaseSvc.games$;
  }

  /**
   * Retrieves a game by its UUID.
   * 
   * @param uuid The UUID of the game.
   * @returns An observable of the game.
   */
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

  /**
   * Retrieves all games.
   * 
   * @returns An observable of the list of games.
   */
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

  /**
   * Adds a new game.
   * 
   * @param game The game to add.
   * @returns An observable of the added game.
   */
  public addGame(game: Game): Observable<Game> {
    return from(this.firebaseSvc.createDocument("games", game)).pipe(
      map(createdDocId => {
        game.uuid = createdDocId;
        return game;
      })
    );
  }

  /**
   * Updates an existing game.
   * 
   * @param game The game to update.
   * @returns An observable of the update operation.
   */
  public updateGame(game: Game): Observable<void> {
    if (!game.uuid) {
      return throwError(new Error("Game does not have UUID"));
    }

    const gameData = { ...game };
    delete gameData.uuid; // Remove UUID to avoid overwriting in Firestore

    return from(this.firebaseSvc.updateDocument("games", gameData, game.uuid)).pipe(
      map(() => {
        const updatedGames = this._games.value.map(g => g.uuid === game.uuid ? game : g);
        this._games.next(updatedGames);
      })
    );
  }

  /**
   * Deletes a game.
   * 
   * @param game The game to delete.
   * @returns An observable of the deleted game.
   */
  public deleteGame(game: Game): Observable<Game> {
    return new Observable<Game>(obs => {
      if (!game.uuid) {
        obs.error(new Error("Game does not have UUID"));
        return;
      }
  
      // Delete the game from the "games" collection
      from(this.firebaseSvc.deleteDocument("games", game.uuid)).subscribe({
        next: () => {
          obs.next(game); // Return the deleted game in the observable
          obs.complete();
        },
        error: error => {
          obs.error(error); // Propagate any error that occurs during the process
        }
      });
    });
  }
}
