import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { BehaviorSubject, from, map, Observable, switchMap } from 'rxjs';
import { Player } from '../../interfaces/player';
import { Team } from '../../interfaces/team';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { FirebaseAuthService } from './firebase/firebase-auth.service';
import { PlayersService } from './player.service';

/**
 * This service handles operations related to teams.
 */
@Injectable({
  providedIn: 'root'
})
export class TeamService {

  /**
   * BehaviorSubject to track the list of teams.
   */
  private _teams: BehaviorSubject<any[]> = new BehaviorSubject<Team[]>([]);

  /**
   * Observable for the list of teams.
   */
  public teams$: Observable<any[]> = this._teams.asObservable();

  /**
   * Unsubscribe function for Firebase listeners.
   */
  private unsubscribe: Unsubscribe | null = null;

  /**
   * Creates an instance of TeamService.
   * 
   * @param api Service to make API requests.
   * @param auth Service to handle authentication.
   * @param firebaseSvc Service to interact with Firebase.
   * @param players Service to handle player operations.
   * @param firebaseAuth Service to handle Firebase authentication.
   */
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private firebaseSvc: FirebaseService,
    private players: PlayersService,
    private firebaseAuth: FirebaseAuthService
  ) {
    this.teams$ = this.firebaseSvc.teams$;
  }

  /**
   * Retrieves a team by its UUID.
   * 
   * @param uuid The UUID of the team.
   * @returns An observable of the team.
   */
  public getTeam(uuid: string): Observable<Team> {
    return from(this.firebaseSvc.getDocument("teams", uuid)).pipe(
      switchMap((doc: FirebaseDocument) => {
        // Obtener los jugadores del equipo
        const playerUUIDs: string[] = doc.data['players'].map((player: any) => player.uuid);
        // Obtener todos los jugadores y filtrar los del equipo
        return this.players.getAll().pipe(
          map((allPlayers: Player[]) => {
            const teamPlayers: Player[] = allPlayers.filter(player => {
              // Verificar si uuid es undefined antes de usarlo
              if (player.uuid !== undefined) {
                return playerUUIDs.includes(player.uuid);
              }
              return false;
            });
            // Crear el objeto Team con los jugadores filtrados
            const payload: Team = {
              uuid: doc.id,
              name: doc.data['name'],
              players: teamPlayers,
              trainers: doc.data['trainers'].map((trainer: { uuid: any; }) => ({ uuid: trainer.uuid })),
              story: doc.data['story'],
              imageUrl: doc.data['imageUrl']
            };
            return payload;
          })
        );
      })
    );
  }

  /**
   * Adds a new team.
   * 
   * @param team The team to add.
   * @returns An observable of the added team.
   */
  public addTeam(team: Team): Observable<Team> {
    return from(this.firebaseSvc.createDocument("teams", team)).pipe(
      switchMap((createdDocId: string) => {
        // Obtener los UUID de los jugadores del equipo
        let playerUUIDs: string[] = [];
        team.players.forEach(player => {
          if (player.uuid) {
            playerUUIDs.push(player.uuid);
          }
        });
        // Actualizar el campo 'players' del documento del equipo con los UUID de los jugadores
        return from(this.firebaseSvc.updateDocumentField("teams", createdDocId, "players", playerUUIDs)).pipe(
          map(() => {
            team.uuid = createdDocId;
            return team; // devolver el equipo creado después de la actualización
          })
        );
      })
    );
  }

  /**
   * Updates an existing team.
   * 
   * @param team The team to update.
   * @returns An observable of the update operation.
   */
  public updateTeam(team: Team): Observable<string[]> {
    return new Observable<string[]>(obs => {
      if (team.uuid) {
        // Inicializar un array para almacenar los UUID de los jugadores
        const playerUUIDs: string[] = [];
        
        // Recorrer los jugadores y agregar sus UUID al array
        if(team.players)
        team.players.forEach(player => {
          if (player.uuid) {
            playerUUIDs.push(player.uuid);
          }
        });
        
        // Actualizar el campo 'players' con el nuevo array de UUID
        from(this.firebaseSvc.updateDocumentField("teams", team.uuid, "players", playerUUIDs))
          .subscribe({
            next: _ => {
              obs.next(playerUUIDs); // Devolver el array de UUID
            },
            error: error => {
              obs.error(error);
            }
          });
      } else {
        obs.error(new Error("Team does not have UUID"));
      }
      if(team.uuid){
        this.firebaseSvc.updateDocumentField("teams",team.uuid,"name",team.name);
        this.firebaseSvc.updateDocumentField("teams",team.uuid,"story",team.story);
        this.firebaseSvc.updateDocumentField("teams",team.uuid,"imageUrl",team.imageUrl);
      }
      else
        obs.error(new Error("Team does not have UUID"));
    });
  }

  /**
   * Deletes a team.
   * 
   * @param team The team to delete.
   * @returns An observable of the deleted team.
   */
  public deleteTeam(team: Team): Observable<Team> {
    return new Observable<Team>(obs => {
      if (!team.uuid) {
        obs.error(new Error("Team does not have UUID"));
        return;
      }
  
      // Eliminar el equipo de la colección "teams"
      from(this.firebaseSvc.deleteDocument("teams", team.uuid)).subscribe({
        next: () => {
          obs.next(team); // Devolver el equipo eliminado en el observable
          obs.complete();
        },
        error: error => {
          obs.error(error); // Propagar cualquier error que ocurra durante el proceso
        }
      });
    });
  }
}
