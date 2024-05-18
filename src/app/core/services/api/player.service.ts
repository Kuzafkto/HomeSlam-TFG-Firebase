import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { BehaviorSubject, Observable, lastValueFrom, map, tap, switchMap, from, of } from 'rxjs';
import { Player } from '../../interfaces/player';
import { User } from '../../interfaces/user';
import { FirebaseDocument, FirebaseService } from '../firebase/firebase.service';

import { ApiService } from './api.service';
import { FirebaseAuthService } from './firebase/firebase-auth.service';
import { AuthStrapiService } from './strapi/auth-strapi.service';

export class playerNotFoundException extends Error {
  // . declare any additional properties or methods .
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  private _players: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public players$: Observable<Player[]> = this._players.asObservable();
  private unsubscribe:Unsubscribe|null = null;

  constructor(
    private firebaseSvc:FirebaseService,
    private firebaseAuth:FirebaseAuthService
  ) {
    //falta el mappingfunction (esperar al profe, mientras NO crear el getAll)
    //this.firebaseSvc.subscribeToCollection("players",this._players,this.mapPlayers);
    this.mapPlayers = this.mapPlayers.bind(this);
    this.players$=this.firebaseSvc.players$;
  }

  // Este no tiene mapeos internos, simplemente datos
  mapPlayers(doc: FirebaseDocument): Player {
    
    // Imprime el UID del usuario actual
    console.log(this.firebaseSvc.user?.uid);
    this.firebaseAuth.user$.subscribe(user => {
      console.log(user);
    }); 
    
    this.firebaseAuth.me().subscribe(user => {
      if(user.players.includes(doc.id)){
        console.log("incluye "+doc.data['name']);
      }
    });
  
    // Luego puedes proceder con el mapeo de doc a Player
    return {
      id: doc.data['id'],
      name: doc.data['name'],
      surname: doc.data['surname'],
      age: doc.data['age'],
      positions: doc.data['positions'],
      uuid: doc.id
    };
  }
  

  mapPlayers2(doc: FirebaseDocument): Player | null {
    let userUid = this.firebaseSvc.user?.uid; // Obtener el UUID del usuario logueado
    if (!userUid) return null; // Salir si no hay usuario logueado
  
    // Verificar si el jugador pertenece al usuario logueado
    if (doc.id === userUid) {
      return {
        id: doc.data['id'],
        name: doc.data['name'],
        surname: doc.data['surname'],
        age: doc.data['age'],
        positions: doc.data['positions'],
        uuid: doc.id
      };
    } else {
      return null; // Devolver null si el jugador no pertenece al usuario logueado
    }
  }
  

  public addPlayer(player:Player):Observable<Player>{
    return from(this.firebaseSvc.createDocument("players", player)).pipe(
      switchMap((created: any) => {
        const docId = created;
        return this.firebaseAuth.me().pipe(
          switchMap((user: User) => {
            if (user && user.uuid) {
              return from(this.firebaseSvc.updateDocumentField("users", user.uuid, "players", user.players.concat(docId))).pipe(
                map(() => player) // Devolver el jugador creado después de la actualización
              );
            } else {
              return new Observable<Player>(obs=>{
                obs.error(new Error('User does not have UUID'));
              });
            }
          })
        );
      })
    );
  }

  public getAll(): Observable<Player[]> {
    // Paso 0: Crear un array vacío de Players
    let players: Player[] = [];
  
    // Paso 1: Hacer un me y traer todos los players del usuario conectado
    return this.firebaseAuth.me().pipe(
      switchMap(user => {
        // Paso 2: Traer todos los players
        return from(this.firebaseSvc.getDocuments("players")).pipe(
          switchMap((documents: FirebaseDocument[]) => {
            // Paso 3: Crear un array para los players que pertenecen al usuario
            const userPlayersIds: string[] = user.players || [];
  
            // Paso 4: Filtrar los documentos de players que pertenecen al usuario
            const userPlayers = documents.filter(doc => userPlayersIds.includes(doc.id));
  
            // Iterar sobre los documentos de players y mapearlos a objetos Player
            userPlayers.forEach(doc => {
              let playerData = doc.data as Player;
              playerData.uuid=doc.id;
              // Supongo que los datos del player son del tipo Player
              players.push(playerData);
            });
            this._players.next(players);
            // Paso 5: Hacer un next con el array resultante
            return of(players);
          })
        );
      })
    );
  }

public getPlayer(uuid:string):Observable<Player>{
  return from(this.firebaseSvc.getDocument("players",uuid)).pipe(switchMap((doc:FirebaseDocument)=>{
      return new Observable<Player>(player=>{
        //aca puedo tratar de usar mappingService
        let payload:Player={
          uuid: doc.id,
          id:doc.data['id'],
          name: doc.data['name'],
          surname: doc.data['surname'],
          age: doc.data['age'],
          positions:doc.data['positions']
        }
        player.next(payload);
      });
  }))
}

public updatePlayer(player:Player):Observable<Player>{
  return new Observable<Player>(obs=>{

    if(player.uuid){
  this.firebaseSvc.updateDocument("players",player,player.uuid);
    obs.next(player);
    }
  else{
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

    // Eliminar el jugador de la colección "players"
    from(this.firebaseSvc.deleteDocument("players", player.uuid)).pipe(
      switchMap(() => {
        // Obtener el usuario actual
        return this.firebaseAuth.me();
      }),
      switchMap((user: User) => {
        // Verificar que el usuario tenga UUID y una lista de jugadores
        if (!user || !user.uuid || !user.players || user.players.length === 0) {
          return new Observable<Player>(obs => {
            obs.error(new Error('User is incomplete'));
          });
        }

        // Eliminar el UUID del jugador del array de jugadores del usuario
        user.players = user.players.filter(uuid => uuid !== player.uuid);

        // Actualizar el documento del usuario
        return from(this.firebaseSvc.updateDocument("users", user, user.uuid));
      })
    ).subscribe({
      next: () => {
        obs.next(player); // Devolver el jugador eliminado en el observable
        obs.complete();
      },
      error: error => {
        obs.error(error); // Propagar cualquier error que ocurra durante el proceso
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
/*

/*en principio lo copiamos pero ni vamos a utilizarlo 
para implementarlo deberiamos de traernos todos
los usuarios de la bbdd, filtrar por usuario, y con el me
traernos los players de ese usuario para borrarlos en la 
bbdd*/

/*

  public deleteAll2():Observable<void>{
 return new Observable(observer => {
      setTimeout(() => {
        this._players.next([]);
        observer.next();
        observer.complete();
      }, 1000);
    });  }*/
}