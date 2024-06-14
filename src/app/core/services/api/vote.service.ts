import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * This service handles operations related to votes.
 */
@Injectable({
  providedIn: 'root'
})
export class VoteService {
  /**
   * Observable for the list of votes.
   */
  votes$: Observable<any[]>;

  /**
   * Observable for the list of teams.
   */
  teams$: Observable<any[]>;

  /**
   * Creates an instance of VoteService.
   * 
   * @param firebaseService Service to interact with Firebase.
   */
  constructor(private firebaseService: FirebaseService) {
    this.votes$ = this.firebaseService.votes$;
    this.teams$ = this.firebaseService.teams$;
  }

  /**
   * Gets votes for a specific game.
   * 
   * @param gameId The ID of the game.
   * @returns An observable of the list of votes for the game.
   */
  getVotesForGame(gameId: string): Observable<any[]> {
    return this.votes$.pipe(
      map(votes => votes.filter(vote => vote.game === gameId && vote.category === 'winnerTeam'))
    );
  }

  /**
   * Counts votes for teams in a specific game.
   * 
   * @param gameId The ID of the game.
   * @returns An observable of an object where the keys are team names and the values are the number of votes.
   */
  countVotesForTeams(gameId: string): Observable<{ [teamName: string]: number }> {
    return this.getVotesForGame(gameId).pipe(
      switchMap(votes =>
        this.teams$.pipe(
          map(teams => {
            return votes.reduce((acc: { [teamName: string]: number }, vote) => {
              const team = teams.find(t => t.uuid === vote.reference);
              const teamName = team ? team.name : 'Unknown Team';
              if (!acc[teamName]) {
                acc[teamName] = 0;
              }
              acc[teamName]++;
              return acc;
            }, {});
          })
        )
      )
    );
  }
}
