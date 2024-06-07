import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  votes$: Observable<any[]>;
  teams$: Observable<any[]>;

  constructor(private firebaseService: FirebaseService) {
    this.votes$ = this.firebaseService.votes$;
    this.teams$ = this.firebaseService.teams$;
  }

  getVotesForGame(gameId: string): Observable<any[]> {
    return this.votes$.pipe(
      map(votes => votes.filter(vote => vote.game === gameId && vote.category === 'winnerTeam'))
    );
  }

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

