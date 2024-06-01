import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { BehaviorSubject, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Player } from '../../interfaces/player';
import { Team } from '../../interfaces/team';
import { User } from '../../interfaces/user';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { FirebaseAuthService } from './firebase/firebase-auth.service';
import { PlayersService } from './player.service';
import { AuthStrapiService } from './strapi/auth-strapi.service';
AuthStrapiService

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private _teams: BehaviorSubject<any[]> = new BehaviorSubject<Team[]>([]);
  public teams$: Observable<any[]> = this._teams.asObservable();
  private unsubscribe:Unsubscribe|null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private firebaseSvc:FirebaseService,
    private players:PlayersService,
    private firebaseAuth:FirebaseAuthService
  ) {
    this.teams$=this.firebaseSvc.teams$;
   }


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
              id: doc.data['id'],
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


  public getAll(): Observable<Team[]> {
    let teams: Team[] = [];
  
    return this.firebaseAuth.me().pipe(
      switchMap(user => {
        // Paso 1: Obtener todos los jugadores
        return from(this.firebaseSvc.getDocuments("players")).pipe(
          switchMap((playerDocuments: FirebaseDocument[]) => {
            // Paso 2: Obtener todos los equipos
            return from(this.firebaseSvc.getDocuments("teams")).pipe(
              switchMap((teamDocuments: FirebaseDocument[]) => {
                // Iterar sobre los documentos de equipos y mapearlos a objetos Team
                const userTeamsIds: string[] = user.teams || [];
  
                // Paso 4: Filtrar los documentos de players que pertenecen al usuario
                const userTeams = teamDocuments.filter(doc => userTeamsIds.includes(doc.id));
                userTeams.forEach(teamDoc => {
                  let teamData = teamDoc.data as Team;
                  teamData.uuid = teamDoc.id;
                  
                  // Inicializar el arreglo de jugadores para este equipo
                  let playersFiltered: Player[]=[];
                  
                  // Iterar sobre los UUID de los jugadores asociados a este equipo
                  teamData.players.forEach(playerUUID => {
                    // Verificar que playerUUID sea una cadena
                    if (typeof playerUUID === 'string') {
                        // Buscar el jugador correspondiente en el arreglo de documentos de jugadores
                        const playerDoc = playerDocuments.find(playerDocument => playerDocument.id === playerUUID);
                        if (playerDoc) {
                            // Obtener los datos del jugador del documento
                            const playerDataFromDocument = playerDoc.data as Player;
                            // Crear un nuevo objeto Player con los datos del documento y el UUID
                            const playerData: Player = {
                                ...playerDataFromDocument,
                                uuid: playerUUID
                            };
                            // Agregar el jugador al arreglo de jugadores del equipo
                            playersFiltered.push(playerData);
                        }
                    }
                });
                
                
                
                
                  teamData.players=playersFiltered;
                  // Agregar el equipo al arreglo de equipos
                  teams.push(teamData);
                });
  
                // Actualizar el subject con los equipos
                this._teams.next(teams);
                
                // Emitir el arreglo de equipos
                return of(teams);
              })
            );
          })
        );
      })
    );
  }

  public addTeam(team: Team): Observable<Team> {
    return from(this.firebaseSvc.createDocument("teams", team)).pipe(
      switchMap((createdDocId: string) => {
        // obtener el usuario actual
        return this.firebaseAuth.me().pipe(
          switchMap((user: User) => {
            if (user && user.uuid) {
              user.teams.push(createdDocId);
              // actualizar el doc
              return from(this.firebaseSvc.updateDocumentField("users", user.uuid, "teams", user.teams)).pipe(
                switchMap(() => {
                  // Obtener los UUID de los jugadores del equipo
                  let playerUUIDs: string[] = [];
                  team.players.forEach(player => {
                    if (player.uuid) {
                      playerUUIDs.push(player.uuid);
                    }
                  });
                  // actualizar el campo 'players' del documento del equipo con los UUID de los jugadores
                  return from(this.firebaseSvc.updateDocumentField("teams", createdDocId, "players", playerUUIDs)).pipe(
                    map(() => team) // devolver el equipo creado después de la actualización
                  );
                })
              );
            } else {
              return throwError(new Error('User does not have UUID'));
            }
          })
        );
      })
    );
  }
  
  
  
  
  
  
  public updateTeam(team: Team): Observable<string[]> {
    return new Observable<string[]>(obs => {
      if (team.uuid) {
        // Inicializar un array para almacenar los UUID de los jugadores
        const playerUUIDs: string[] = [];
        
        // Recorrer los jugadores y agregar sus UUID al array
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
  
  
  

  public deleteTeam(team: Team): Observable<Team> {
    return new Observable<Team>(obs => {
      if (!team.uuid) {
        obs.error(new Error("Team does not have UUID"));
        return;
      }
  
      // Eliminar el equipo de la colección "teams"
      from(this.firebaseSvc.deleteDocument("teams", team.uuid)).pipe(
        switchMap(() => {
          // Obtener el usuario actual
          return this.firebaseAuth.me();
        }),
        switchMap((user: User) => {
          // Verificar que el usuario tenga UUID y una lista de equipos
          if (!user || !user.uuid || !user.teams || user.teams.length === 0) {
            return new Observable<Team>(obs => {
              obs.error(new Error('User is incomplete'));
            });
          }
  
          // Eliminar el UUID del equipo del array de equipos del usuario
          user.teams = user.teams.filter(uuid => uuid !== team.uuid);
  
          // Actualizar el documento del usuario
          return from(this.firebaseSvc.updateDocument("users", user, user.uuid));
        })
      ).subscribe({
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
