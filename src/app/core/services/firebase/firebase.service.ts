import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, from, of, switchMap, map, take, toArray } from "rxjs";
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, addDoc, collection, updateDoc, doc, onSnapshot, getDoc, setDoc, query, where, getDocs, Unsubscribe, DocumentData, deleteDoc, Firestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes, FirebaseStorage } from "firebase/storage";
import { createUserWithEmailAndPassword, deleteUser, signInAnonymously, signOut, signInWithEmailAndPassword, initializeAuth, indexedDBLocalPersistence, UserCredential, Auth, User } from "firebase/auth";

/**
 * Interface representing a file in Firebase Storage.
 * This interface is used to define the structure of a file object that is stored in Firebase Storage.
 */
export interface FirebaseStorageFile {
  /**
   * The path in Firebase Storage where the file is stored.
   */
  path: string;

  /**
   * The URL or reference to the actual file in Firebase Storage.
   */
  file: string;
}

/**
 * Interface representing a document in Firestore.
 * This interface is used to define the structure of a document object that is stored in Firestore.
 */
export interface FirebaseDocument {
  /**
   * The unique identifier of the document in Firestore.
   */
  id: string;

  /**
   * The data contained in the document. This can be of any type and represents the fields and values stored in the document.
   */
  data: DocumentData;
}


/**
 * Interface representing a user credential in Firebase Authentication.
 * This interface is used to define the structure of a user credential object that is returned
 * after a successful authentication operation (e.g., sign-in, sign-up) with Firebase Authentication.
 */
export interface FirebaseUserCredential {
  /**
   * The user credential object provided by Firebase Authentication.
   * This includes details about the authenticated user and authentication tokens.
   */
  user: UserCredential;
}


/**
 * This service handles interactions with Firebase, including authentication, Firestore operations, and storage.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private _app!: FirebaseApp;  // Firebase app instance
  private _db!: Firestore;  // Firestore instance
  private _auth!: Auth;  // Firebase Auth instance
  private _webStorage!: FirebaseStorage;  // Firebase Storage instance
  private _user: User | null = null;  // Currently authenticated user

  // BehaviorSubjects to track various states and data
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
  public isOwner$: Observable<boolean> = this._isOwner.asObservable();

  /**
   * Creates an instance of FirebaseService.
   * @param config The Firebase configuration object.
   */
  constructor(
    @Inject('firebase-config') config: any
  ) {
    this.init(config);
  }

  /**
   * Initializes the Firebase app, Firestore, authentication, and storage.
   * @param firebaseConfig The Firebase configuration object.
   */
  public init(firebaseConfig: any) {
    this._app = initializeApp(firebaseConfig);
    this._db = getFirestore(this._app);
    this._webStorage = getStorage(this._app);
    this._auth = initializeAuth(getApp(), { persistence: indexedDBLocalPersistence });
    this._auth.onAuthStateChanged(async user => {
      this._user = user;
      if (user) {
        if (user.uid && user.email) {
          this._isLogged.next(true);
          // Subscribe to collections
          console.log(user.uid, "User ID:", user.email);
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

  /**
   * Returns the currently authenticated user.
   * @returns The currently authenticated user or null.
   */
  public get user(): User | null {
    return this._user;
  }

  /**
   * Checks the status of the user and updates admin and owner status accordingly.
   * @param userId The ID of the user to check.
   */
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

  /**
   * Uploads a file to Firebase Storage.
   * @param blob The file to upload as a Blob.
   * @param mimeType The MIME type of the file.
   * @param path The path in Firebase Storage to upload the file to.
   * @param prefix A prefix for the file name.
   * @param extension The file extension.
   * @returns A promise that resolves to the uploaded file's metadata.
   */
  public fileUpload(blob: Blob, mimeType: string, path: string, prefix: string, extension: string): Promise<FirebaseStorageFile> {
    return new Promise(async (resolve, reject) => {
      if (!this._webStorage || !this._auth) {
        reject({ msg: "Not connected to FireStorage" });
      }
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
      const metadata = { contentType: mimeType };
      uploadBytes(storageRef, blob).then(async (snapshot) => {
        getDownloadURL(storageRef).then(async downloadURL => {
          if (freeConnection) await signOut(this._auth!);
          resolve({ path, file: downloadURL });
        }).catch(async error => {
          if (freeConnection) await signOut(this._auth!);
          reject(error);
        });
      }).catch(async (error) => {
        if (freeConnection) await signOut(this._auth!);
        reject(error);
      });
    });
  }

  /**
   * Uploads an image to Firebase Storage.
   * @param blob The image file as a Blob.
   * @returns A promise that resolves to the uploaded image's metadata.
   */
  public imageUpload(blob: Blob): Promise<any> {
    return this.fileUpload(blob, 'image/jpeg', 'images', 'image', ".jpg");
  }

  /**
   * Creates a new document in a Firestore collection.
   * @param collectionName The name of the collection to create the document in.
   * @param data The data to include in the document.
   * @returns A promise that resolves to the ID of the created document.
   */
  public createDocument(collectionName: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      const collectionRef = collection(this._db!, collectionName);
      addDoc(collectionRef, data).then(docRef => resolve(docRef.id)).catch(err => reject(err));
    });
  }

  /**
   * Creates a new document with a specified ID in a Firestore collection.
   * @param collectionName The name of the collection to create the document in.
   * @param data The data to include in the document.
   * @param docId The ID to assign to the document.
   * @returns A promise that resolves when the document is created.
   */
  public createDocumentWithId(collectionName: string, data: any, docId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._db) {
        reject({ msg: 'Database is not connected' });
      }
      const docRef = doc(this._db!, collectionName, docId);
      setDoc(docRef, data).then(() => resolve()).catch((err) => reject(err));
    });
  }

  /**
   * Updates an existing document in a Firestore collection.
   * @param collectionName The name of the collection.
   * @param data The data to update the document with.
   * @param document The ID of the document to update.
   * @returns A promise that resolves when the document is updated.
   */
  public updateDocument(collectionName: string, data: any, document: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      const collectionRef = collection(this._db!, collectionName);
      updateDoc(doc(collectionRef, document), data).then(docRef => resolve()).catch(err => reject(err));
    });
  }

  /**
   * Retrieves all documents from a Firestore collection.
   * @param collectionName The name of the collection to retrieve documents from.
   * @returns A promise that resolves to an array of documents.
   */
  public getDocuments(collectionName: string): Promise<FirebaseDocument[]> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      const querySnapshot = await getDocs(collection(this._db!, collectionName));
      resolve(querySnapshot.docs.map<FirebaseDocument>(doc => ({ id: doc.id, data: doc.data() })));
    });
  }

  /**
   * Retrieves a specific document from a Firestore collection.
   * @param collectionName The name of the collection.
   * @param document The ID of the document to retrieve.
   * @returns A promise that resolves to the retrieved document.
   */
  public getDocument(collectionName: string, document: string): Promise<FirebaseDocument> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      const docRef = doc(this._db!, collectionName, document);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        resolve({ id: docSnap.id, data: docSnap.data() });
      } else {
        reject('Document does not exist');
      }
    });
  }

  /**
   * Retrieves documents from a Firestore collection that match a specific field value.
   * @param collectionName The name of the collection.
   * @param field The field to filter by.
   * @param value The value to filter by.
   * @returns A promise that resolves to an array of matching documents.
   */
  public getDocumentsBy(collectionName: string, field: string, value: any): Promise<FirebaseDocument[]> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      const q = query(collection(this._db!, collectionName), where(field, "==", value));
      const querySnapshot = await getDocs(q);
      resolve(querySnapshot.docs.map<FirebaseDocument>(doc => ({ id: doc.id, data: doc.data() })));
    });
  }

  /**
   * Deletes a specific document from a Firestore collection.
   * @param collectionName The name of the collection.
   * @param docId The ID of the document to delete.
   * @returns A promise that resolves when the document is deleted.
   */
  public deleteDocument(collectionName: string, docId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      resolve(await deleteDoc(doc(this._db!, collectionName, docId)));
    });
  }

  /**
   * Subscribes to a Firestore collection and updates a BehaviorSubject with the collection data.
   * @param collectionName The name of the collection to subscribe to.
   * @param subject The BehaviorSubject to update with the collection data.
   * @param mapFunction A function to map the document data to a specific format.
   * @returns An unsubscribe function to stop the subscription.
   */
  public subscribeToCollection(collectionName: string, subject: BehaviorSubject<any[]>, mapFunction: (el: FirebaseDocument) => any): Unsubscribe | null {
    if (!this._db) {
      return null;
    }
    return onSnapshot(collection(this._db, collectionName), (snapshot) => {
      subject.next(snapshot.docs.map<FirebaseDocument>(doc => ({ id: doc.id, data: doc.data() })).map(mapFunction));
    }, error => { });
  }

  /**
   * Signs out the current user.
   * @param signInAnon Whether to sign in anonymously after signing out.
   * @returns A promise that resolves when the user is signed out.
   */
  public signOut(signInAnon: boolean = false): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (this._auth) {
        try {
          await this._auth.signOut();
          if (signInAnon) await this.connectAnonymously();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * Checks if a user is currently connected.
   * @returns A promise that resolves to a boolean indicating if a user is connected.
   */
  public isUserConnected(): Promise<boolean> {
    const response = new Promise<boolean>(async (resolve, reject) => {
      if (!this._auth) {
        resolve(false);
      }
      resolve(this._auth!.currentUser != null);
    });
    return response;
  }

  /**
   * Checks if a user is currently connected anonymously.
   * @returns A promise that resolves to a boolean indicating if a user is connected anonymously.
   */
  public isUserConnectedAnonymously(): Promise<boolean> {
    const response = new Promise<boolean>(async (resolve, reject) => {
      if (!this._auth) {
        resolve(false);
      }
      resolve(this._auth!.currentUser != null && this._auth!.currentUser.isAnonymous);
    });
    return response;
  }

  /**
   * Connects a user anonymously.
   * @returns A promise that resolves when the user is connected anonymously.
   */
  public connectAnonymously(): Promise<void> {
    const response = new Promise<void>(async (resolve, reject) => {
      if (!this._auth) {
        resolve();
      }
      if (!(await this.isUserConnected()) && !(await this.isUserConnectedAnonymously())) {
        await signInAnonymously(this._auth!).catch(error => reject(error));
        resolve();
      } else if (await this.isUserConnectedAnonymously()) {
        resolve();
      } else {
        reject({ msg: "A user is already connected" });
      }
    });
    return response;
  }

  /**
   * Creates a new user with an email and password.
   * @param email The email of the new user.
   * @param password The password of the new user.
   * @returns A promise that resolves to the created user's credentials.
   */
  public createUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential | null> {
    return new Promise(async (resolve, reject) => {
      if (!this._auth) {
        resolve(null);
      }
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

  /**
   * Connects a user with an email and password.
   * @param email The email of the user.
   * @param password The password of the user.
   * @returns A promise that resolves to the connected user's credentials.
   */
  public connectUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential | null> {
    return new Promise<FirebaseUserCredential | null>(async (resolve, reject) => {
      if (!this._auth) {
        resolve(null);
      }
      resolve({ user: await signInWithEmailAndPassword(this._auth!, email, password) });
    });
  }

  /**
   * Deletes the currently authenticated user.
   * @returns A promise that resolves when the user is deleted.
   */
  public deleteUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this._user) {
        reject();
      }
      resolve(deleteUser(this._user!));
    });
  }

  /**
   * Updates a specific field in a document in a Firestore collection.
   * @param collectionName The name of the collection.
   * @param document The ID of the document to update.
   * @param fieldName The name of the field to update.
   * @param fieldValue The value to update the field with.
   * @returns A promise that resolves when the field is updated.
   */
  public updateDocumentField(collectionName: string, document: string, fieldName: string, fieldValue: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      const documentRef = doc(this._db as Firestore, collectionName, document);
      const fieldUpdate = { [fieldName]: fieldValue };
      try {
        await updateDoc(documentRef, fieldUpdate);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Maps a Firestore document to a user object.
   * @param doc The Firestore document data.
   * @returns The mapped user object.
   */
  public mapUser(doc: DocumentData): any {
    return {
      email: doc['email'],
      name: doc['name'],
      nickname: doc['nickname'],
      picture: doc['picture'],
      isAdmin: doc['isAdmin'],
      isOwner: doc['isOwner'],
      uuid: doc["id"]
    };
  }

  /**
   * Subscribes to the players collection in Firestore.
   * @param subject The BehaviorSubject to update with the players data.
   * @param mapFunction A function to map the document data to a specific format.
   * @returns An unsubscribe function to stop the subscription.
   */
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

  /**
   * Subscribes to the users collection in Firestore.
   * @param subject The BehaviorSubject to update with the users data.
   * @param mapFunction A function to map the document data to a specific format.
   * @returns An unsubscribe function to stop the subscription.
   */
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

  /**
   * Subscribes to the teams collection in Firestore.
   * @param subject The BehaviorSubject to update with the teams data.
   * @param mapFunction A function to map the document data to a specific format.
   * @param playersSubject The BehaviorSubject to update with the players data.
   * @returns An unsubscribe function to stop the subscription.
   */
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

        // Get players for each team based on player's UUID
        playersSubject.pipe(take(1)).subscribe(players => {
          teams.forEach(team => {
            if (Array.isArray(team.players)) {
              const teamPlayers = players.filter(player => team.players.includes(player.uuid));
              team.players = teamPlayers;
            } else {
              team.players = []; // Initialize as an empty array if no players property
            }
          });
          console.log('Updated teams:', teams);
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

  /**
   * Subscribes to the games collection in Firestore.
   * @param subject The BehaviorSubject to update with the games data.
   * @param mapFunction A function to map the document data to a specific format.
   * @param teamsSubject The BehaviorSubject to update with the teams data.
   * @returns An unsubscribe function to stop the subscription.
   */
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

        // Map teams to games
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

  /**
   * Subscribes to the votes collection in Firestore.
   * @param subject The BehaviorSubject to update with the votes data.
   * @param mapFunction A function to map the document data to a specific format.
   * @returns An unsubscribe function to stop the subscription.
   */
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
