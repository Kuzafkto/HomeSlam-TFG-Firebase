import { Inject, Injectable } from '@angular/core';
import { Player } from 'src/app/core/interfaces/player';
import { PaginatedData } from '../../../interfaces/data';
import { StrapiExtendedUser, StrapiResponse } from '../../../interfaces/strapi';
import { User } from '../../../interfaces/user';
import { FirebaseService } from '../../firebase/firebase.service';
import { MappingService } from '../mapping.service';

/**
 * Service to handle mapping between Firebase data and application data models.
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseMappingService extends MappingService {

  /**
   * Maps paginated data to a list of users.
   * 
   * @param data The paginated data from the backend.
   * @returns The paginated data mapped to the User interface.
   */
  public mapUsers(data: PaginatedData<any>): PaginatedData<User> {
    throw new Error('Method not implemented.');
  }

  /**
   * Maps backend data to a single user.
   * 
   * @param data The data from the backend.
   * @returns The data mapped to the User interface.
   */
  public mapUser(data: any): User {
    throw new Error('Method not implemented.');
  }

  /**
   * Creates an instance of FirebaseMappingService.
   */
  constructor() {
    super();
  }

  /**
   * Returns the URL to query for users.
   * 
   * @returns The URL string.
   */
  public queryUsersUrl(): string {
    return 'extended-users?populate=picture&sort=id';
  }

  /**
   * Returns the URL to get a specific user by ID.
   * 
   * @param id The ID of the user.
   * @returns The URL string.
   */
  public getUserUrl(id: number): string {
    return `extended-users/${id}/?populate=picture&sort=id`;
  }

  /**
   * Returns the URL to update a specific user by ID.
   * 
   * @param id The ID of the user.
   * @returns The URL string.
   */
  public updateUserUrl(id: number): string {
    return `extended-users/${id}`;
  }

  /**
   * Returns the URL to delete a specific user by ID.
   * 
   * @param id The ID of the user.
   * @returns The URL string.
   */
  public deleteUserUrl(id: number): string {
    return `extended-users/${id}`;
  }

  // PLAYERS

  /**
   * Returns the URL to query for players.
   * 
   * @returns The URL string.
   */
  public queryPlayersUrl(): string {
    return 'players?populate=picture&sort=id';
  }

  /**
   * Returns the URL to get a specific player by ID.
   * 
   * @param id The ID of the player.
   * @returns The URL string.
   */
  public getPlayerUrl(id: number): string {
    return `players/${id}/?populate=picture&sort=id`;
  }

  /**
   * Returns the URL to update a specific player by ID.
   * 
   * @param id The ID of the player.
   * @returns The URL string.
   */
  public updatePlayerUrl(id: number): string {
    return `players/${id}`;
  }

  /**
   * Returns the URL to delete a specific player by ID.
   * 
   * @param id The ID of the player.
   * @returns The URL string.
   */
  public deletePlayerUrl(id: number): string {
    return `players/${id}`;
  }

  /*
    public mapPlayers(data: PaginatedData<any>): PaginatedData<Player> {
      const strapi_data: PaginatedData<StrapiPlayer> = { ...data };
      return {
        data: strapi_data.data.map(player => {
          return {
            id: user.id,
            name: user.name,
            surname: user.surname,
            nickname: user.nickname,
            picture: user.picture?.data ? {
              id: user.picture.data.id,
              url_large: user.picture.data.attributes.formats.large?.url,
              url_small: user.picture.data.attributes.formats.small?.url,
              url_medium: user.picture.data.attributes.formats.medium?.url,
              url_thumbnail: user.picture.data.attributes.formats.thumbnail?.url,
            } : null
          };
        }),
        pagination: data.pagination
      };
    }
    public mapUser(data: StrapiExtendedUser): User {
      return {
        id: data.id,
        name: data.name,
        surname: data.surname,
        nickname: data.nickname,
        picture: data.picture?.data ? {
          id: data.picture.data.id,
          url_large: data.picture.data.attributes.formats.large?.url,
          url_small: data.picture.data.attributes.formats.small?.url,
          url_medium: data.picture.data.attributes.formats.medium?.url,
          url_thumbnail: data.picture.data.attributes.formats.thumbnail?.url,
        } : null
      };
    }
  */
}
