import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, from, of, switchMap, map, take, toArray } from "rxjs";
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, addDoc, collection, updateDoc, doc, onSnapshot, getDoc, setDoc, query, where, getDocs, Unsubscribe, DocumentData, deleteDoc, Firestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes, FirebaseStorage } from "firebase/storage";
import { createUserWithEmailAndPassword, deleteUser, signInAnonymously, signOut, signInWithEmailAndPassword, initializeAuth, indexedDBLocalPersistence, UserCredential, Auth, User } from "firebase/auth";

export interface FirebaseStorageFile {
  path: string,
  file: string
};

export interface FirebaseDocument {
  id: string;
  data: DocumentData;
}

export interface FirebaseUserCredential {
  user: UserCredential
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private _app!: FirebaseApp;
  private _db!: Firestore;
  private _auth!: Auth;
  private _webStorage!: FirebaseStorage;
  private _user: User | null = null;
  private _isLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLogged$: Observable<boolean> = this._isLogged.asObservable();
  private _players: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public players$: Observable<any[]> = this._players.asObservable();
  private _teams: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public teams$: Observable<any[]> = this._teams.asObservable();
  private _games: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public games$: Observable<any[]> = this._games.asObservable();
  private _votes: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public votes$: Observable<any[]> = this._votes.asObservable();
  private _users: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public users$: Observable<any[]> = this._users.asObservable();
  private _isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this._isAdmin.asObservable();
  private _isOwner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isOwner$: Observable<boolean> = this._isAdmin.asObservable();

  constructor(
    @Inject('firebase-config') config: any
  ) {
    this.init(config);
  }

  public init(firebaseConfig: any) {
    // Initialize Firebase
    this._app = initializeApp(firebaseConfig);
    this._db = getFirestore(this._app);
    this._webStorage = getStorage(this._app);
    this._auth = initializeAuth(getApp(), { persistence: indexedDBLocalPersistence });
    this._auth.onAuthStateChanged(async user => {
      this._user = user;
      if (user) {
        if (user.uid && user.email) {
          this._isLogged.next(true);
          //todos los subscribetocollection aqui
          console.log(user.uid, "yyyyyyyyy", user.email);
          this.subscribeToPlayers(this._players, (el: any) => el);
          this.subscribeToTeams(this._teams, (el: any) => el, this._players);
          this.subscribeToGames(this._games, (el: any) => el, this._teams);
          this.subscribeToVotes(this._votes, (el: any) => el);
          this.subscribeToUsers(this._users, this.mapUser);
          this.checkUserStatus(user.uid);

        }
      } else {
        this._isLogged.next(false);
        this._isAdmin.next(false);
      }
    });
  }

  public get user(): User | null {
    return this._user;
  }

  private checkUserStatus(userId: string) {
    const userDocRef = doc(this._db, 'users', userId);
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        this._isAdmin.next(userData["isAdmin"] === true);
        this._isOwner.next(userData["isOwner"] === true);
      } else {
        this._isAdmin.next(false);
        this._isOwner.next(false);
      }
    });
  }

  public fileUpload(blob: Blob, mimeType: string, path: string, prefix: string, extension: string): Promise<FirebaseStorageFile> {
    return new Promise(async (resolve, reject) => {
      if (!this._webStorage || !this._auth)
        reject({
          msg: "Not connected to FireStorage"
        });
      var freeConnection = false;
      if (this._auth && !this._auth.currentUser) {
        try {
          await signInAnonymously(this._auth);
          freeConnection = true;
        } catch (error) {
          reject(error);
        }
      }
      const url = path + "/" + prefix + "-" + Date.now() + extension;
      const storageRef = ref(this._webStorage!, url);
      const metadata = {
        contentType: mimeType,
      };
      uploadBytes(storageRef, blob).then(async (snapshot) => {
        getDownloadURL(storageRef).then(async downloadURL => {
          if (freeConnection)
            await signOut(this._auth!);
          resolve({
            path,
            file: downloadURL,
          });
        }).catch(async error => {
          if (freeConnection)
            await signOut(this._auth!);
          reject(error);
        });
      }).catch(async (error) => {
        if (freeConnection)
          await signOut(this._auth!);
        reject(error);
      });
    });
  }

  public imageUpload(blob: Blob): Promise<any> {
    return this.fileUpload(blob, 'image/jpeg', 'images', 'image', ".jpg");
  }

  public createDocument(collectionName: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const collectionRef = collection(this._db!, collectionName);
      addDoc(collectionRef, data).then(docRef => resolve(docRef.id)
      ).catch(err => reject(err));
    });
  }

  public createDocumentWithId(
    collectionName: string,
    data: any,
    docId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._db) {
        reject({
          msg: 'Database is not connected',
        });
      }
      const docRef = doc(this._db!, collectionName, docId);
      setDoc(docRef, data)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  public updateDocument(collectionName: string, data: any, document: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const collectionRef = collection(this._db!, collectionName);
      updateDoc(doc(collectionRef, document), data).then(docRef => resolve()
      ).catch(err => reject(err));
    });
  }

  public getDocuments(collectionName: string): Promise<FirebaseDocument[]> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const querySnapshot = await getDocs(collection(this._db!, collectionName));
      resolve(querySnapshot.docs.map<FirebaseDocument>(doc => {
        return { id: doc.id, data: doc.data() }
      }));
    });
  }

  public getDocument(collectionName: string, document: string): Promise<FirebaseDocument> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const docRef = doc(this._db!, collectionName, document);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        resolve({ id: docSnap.id, data: docSnap.data() });
      } else {
        // doc.data() will be undefined in this case
        reject('document does not exists');
      }
    });
  }

  public getDocumentsBy(collectionName: string, field: string, value: any): Promise<FirebaseDocument[]> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const q = query(collection(this._db!, collectionName), where(field, "==", value));

      const querySnapshot = await getDocs(q);
      resolve(querySnapshot.docs.map<FirebaseDocument>(doc => {
        return { id: doc.id, data: doc.data() }
      }));
    });
  }

  public deleteDocument(collectionName: string, docId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      resolve(await deleteDoc(doc(this._db!, collectionName, docId)));
    });
  }

  public subscribeToCollection(collectionName: string, subject: BehaviorSubject<any[]>, mapFunction: (el: FirebaseDocument) => any): Unsubscribe | null {
    if (!this._db)
      return null;
    return onSnapshot(collection(this._db, collectionName), (snapshot) => {
      subject.next(snapshot.docs.map<FirebaseDocument>(doc => {
        return { id: doc.id, data: doc.data() }
      }).map(mapFunction));
    }, error => { });
  }

  public signOut(signInAnon: boolean = false): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (this._auth)
        try {
          await this._auth.signOut();
          if (signInAnon)
            await this.connectAnonymously();
          resolve();
        } catch (error) {
          reject(error);
        }
    });

  }

  public isUserConnected(): Promise<boolean> {
    const response = new Promise<boolean>(async (resolve, reject) => {
      if (!this._auth)
        resolve(false);
      resolve(this._auth!.currentUser != null)
    });
    return response;
  }

  public isUserConnectedAnonymously(): Promise<boolean> {
    const response = new Promise<boolean>(async (resolve, reject) => {
      if (!this._auth)
        resolve(false);
      resolve(this._auth!.currentUser != null && this._auth!.currentUser.isAnonymous);
    });
    return response;

  }

  public connectAnonymously(): Promise<void> {
    const response = new Promise<void>(async (resolve, reject) => {
      if (!this._auth)
        resolve();
      if (!(await this.isUserConnected()) && !(await this.isUserConnectedAnonymously())) {
        await signInAnonymously(this._auth!).catch(error => reject(error));
        resolve();
      }
      else if (await this.isUserConnectedAnonymously())
        resolve();
      else
        reject({ msg: "An user is already connected" });

    });
    return response;
  }

  public createUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential | null> {
    return new Promise(async (resolve, reject) => {
      if (!this._auth)
        resolve(null);
      try {
        resolve({ user: await createUserWithEmailAndPassword(this._auth!, email, password) });
      } catch (error: any) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            console.log(`Email address ${email} already in use.`);
            break;
          case 'auth/invalid-email':
            console.log(`Email address ${email} is invalid.`);
            break;
          case 'auth/operation-not-allowed':
            console.log(`Error during sign up.`);
            break;
          case 'auth/weak-password':
            console.log("Password is not strong enough. Add additional characters including special characters and numbers.");
            break;
          default:
            console.log(error.message);
            break;
        }
        reject(error);
      }
    });

  }

  public connectUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential | null> {
    return new Promise<FirebaseUserCredential | null>(async (resolve, reject) => {
      if (!this._auth)
        resolve(null);
      resolve({ user: await signInWithEmailAndPassword(this._auth!, email, password) });
    });

  }

  public deleteUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this._user)
        reject();
      resolve(deleteUser(this._user!));
    });
  }

  public updateDocumentField(collectionName: string, document: string, fieldName: string, fieldValue: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({
          msg: "Database is not connected"
        });
      }

      const documentRef = doc(this._db as Firestore, collectionName, document);
      const fieldUpdate = { [fieldName]: fieldValue }; // Crear un objeto con el campo a actualizar

      try {
        await updateDoc(documentRef, fieldUpdate);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Mapeo para los usuarios
  public mapUser(doc: DocumentData): any {
    return {
      email: doc['email'],
      name: doc['name'],
      nickname: doc['nickname'],
      picture: doc['picture'],
      isAdmin:doc['isAdmin'],
      isOwner:doc['isOwner'],
      uuid: doc["id"]
    };
  }

  public async subscribeToPlayers(subject: BehaviorSubject<any[]>, mapFunction: (el: DocumentData) => any): Promise<Unsubscribe | null> {
    if (!this._db) {
      return null;
    }

    try {
      const playersRef = collection(this._db, "players");
      const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
        const players = snapshot.docs.map(doc => {
          const playerData = mapFunction(doc.data());
          playerData.uuid = doc.id;
          return playerData;
        });
        subject.next(players);
      }, (error) => {
        console.error('Error in onSnapshot:', error);
      });

      return unsubscribePlayers;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  public async subscribeToUsers(subject: BehaviorSubject<any[]>, mapFunction: (el: DocumentData) => any): Promise<Unsubscribe | null> {
    if (!this._db) {
      return null;
    }

    try {
      const usersRef = collection(this._db, "users");
      const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => {
          const userData = mapFunction(doc.data());
          userData.uuid = doc.id;
          return userData;
        });
        subject.next(users);
      }, (error) => {
        console.error('Error in onSnapshot:', error);
      });

      return unsubscribeUsers;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  public async subscribeToTeams(subject: BehaviorSubject<any[]>, mapFunction: (el: DocumentData) => any, playersSubject: BehaviorSubject<any[]>): Promise<Unsubscribe | null> {
    if (!this._db) {
      return null;
    }

    try {
      const teamsRef = collection(this._db, "teams");
      const unsubscribeTeams = onSnapshot(teamsRef, async (snapshot) => {
        const teams = snapshot.docs.map(doc => {
          const teamData = mapFunction(doc.data());
          teamData.uuid = doc.id;
          return teamData;
        });
        console.log('Teams:', teams);

        // Obtener jugadores del usuario
        playersSubject.pipe(take(1)).subscribe(players => {
          // Para cada equipo, filtrar los jugadores del equipo con los jugadores del usuario
          teams.forEach(team => {
            if (Array.isArray(team.players)) {
              const teamPlayers = players.filter(player => team.players.includes(player.uuid));
              team.players = teamPlayers;
            } else {
              team.players = []; // Inicializar como array vacío si no tiene la propiedad players
            }
          });
          console.log('Equipos actualizados:', teams);

          subject.next(teams);
        });

      }, (error) => {
        console.error('Error in onSnapshot:', error);
      });

      return unsubscribeTeams;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  public async subscribeToGames(subject: BehaviorSubject<any[]>, mapFunction: (el: DocumentData) => any, teamsSubject: BehaviorSubject<any[]>): Promise<Unsubscribe | null> {
    if (!this._db) {
      return null;
    }

    try {
      const gamesRef = collection(this._db, "games");
      const unsubscribeGames = onSnapshot(gamesRef, async (snapshot) => {
        const games = snapshot.docs.map(doc => {
          const gameData = mapFunction(doc.data());
          gameData.uuid = doc.id;
          return gameData;
        });

        // Obtener los equipos y mapearlos a los juegos
        teamsSubject.pipe(take(1)).subscribe(teams => {
          games.forEach(game => {
            game.local = teams.find(team => team.uuid === game.local) || null;
            game.visitor = teams.find(team => team.uuid === game.visitor) || null;
          });
          subject.next(games);
        });

      }, (error) => {
        console.error('Error in onSnapshot:', error);
      });

      return unsubscribeGames;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  
  public async subscribeToVotes(subject: BehaviorSubject<any[]>, mapFunction: (el: DocumentData) => any): Promise<Unsubscribe | null> {
    if (!this._db) {
      return null;
    }
  
    try {
      const votesRef = collection(this._db, "votes");
      const unsubscribeVotes = onSnapshot(votesRef, (snapshot) => {
        const votes = snapshot.docs.map(doc => {
          const voteData = mapFunction(doc.data());
          voteData.uuid = doc.id;
          return voteData;
        });
        subject.next(votes);
      }, (error) => {
        console.error('Error in onSnapshot:', error);
      });
  
      return unsubscribeVotes;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}
