import { Inject, Injectable } from '@angular/core';
import { PaginatedData } from '../../../interfaces/data';
import { StrapiExtendedUser, StrapiResponse } from '../../../interfaces/strapi';
import { User } from '../../../interfaces/user';
import { MappingService } from '../mapping.service';

/**
 * This service handles mapping between Strapi data and application data models. Note that this service is not currently being utilized.
 */
export class StrapiMappingService extends MappingService {

  /**
   * Creates an instance of StrapiMappingService.
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

  /**
   * Maps paginated data to a list of users.
   * 
   * @param data The paginated data from the backend.
   * @returns The paginated data mapped to the User interface.
   */
  public mapUsers(data: PaginatedData<any>): PaginatedData<User> {
    const strapi_data: PaginatedData<StrapiExtendedUser> = { ...data };
    return {
      data: strapi_data.data.map(user => {
        return {
          id: user.id,
          name: user.name,
          surname: user.surname,
          nickname: user.nickname,
          picture: user.picture?.data 
            ? user.picture.data.attributes.formats.large?.url || 
              user.picture.data.attributes.formats.medium?.url || 
              user.picture.data.attributes.formats.small?.url || 
              user.picture.data.attributes.formats.thumbnail?.url 
            : undefined,
          email: user.email,
          isAdmin: user.isAdmin,
          isOwner: user.isOwner
        };
      }),
      pagination: data.pagination
    };
  }

  /**
   * Maps backend data to a single user.
   * 
   * @param data The data from the backend.
   * @returns The data mapped to the User interface.
   */
  public mapUser(data: StrapiExtendedUser): User {
    return {
      id: data.id,
      name: data.name,
      surname: data.surname,
      nickname: data.nickname,
      picture: data.picture?.data 
        ? data.picture.data.attributes.formats.large?.url || 
          data.picture.data.attributes.formats.medium?.url || 
          data.picture.data.attributes.formats.small?.url || 
          data.picture.data.attributes.formats.thumbnail?.url 
        : undefined,
      email: data.email,
      isAdmin: data.isAdmin,
      isOwner: data.isOwner
    };
  }
}
