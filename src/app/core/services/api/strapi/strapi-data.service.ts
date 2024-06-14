import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { StrapiArrayResponse, StrapiResponse } from '../../../interfaces/strapi';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { PaginatedData } from '../../../interfaces/data';

/**
 * This service handles data operations using Strapi. Note that this service is not currently being utilized.
 */
export class StrapiDataService extends DataService {

  /**
   * Creates an instance of StrapiDataService.
   * 
   * @param api Service to make API requests.
   */
  constructor(
    protected api: ApiService
  ) {
    super();
  }

  /**
   * Queries the Strapi API for a list of resources with the given parameters.
   * 
   * @param resource The resource to query.
   * @param params The query parameters.
   * @returns An observable of the paginated data.
   */
  public query<T>(resource: string, params: any): Observable<PaginatedData<T>> {
    return this.api.get(`/${resource}`, params).pipe(map((response: StrapiArrayResponse<T>) => {
      return {
        data: response.data.map(data => { return { ...(data.attributes), id: data.id }; }),
        pagination: response.meta.pagination!
      };
    }));
  }

  /**
   * Gets a single resource from the Strapi API.
   * 
   * @param resource The resource to get.
   * @returns An observable of the resource data.
   */
  public get<T>(resource: string): Observable<T> {
    return this.api.get(`/${resource}`).pipe(map((response: StrapiResponse<T>) => {
      return { id: response.data.id, ...(response.data.attributes) };
    }));
  }

  /**
   * Posts a new resource to the Strapi API.
   * 
   * @param resource The resource to post.
   * @param data The data to post.
   * @returns An observable of the posted resource data.
   */
  public post<T>(resource: string, data: any): Observable<T> {
    return this.api.post(`/${resource}`, { data: data } as Object).pipe(map((response: StrapiResponse<T>) => {
      return { id: response.data.id, ...response.data.attributes };
    }));
  }

  /**
   * Updates a resource in the Strapi API.
   * 
   * @param resource The resource to update.
   * @param data The data to update.
   * @returns An observable of the updated resource data.
   */
  public put<T>(resource: string, data: any): Observable<T> {
    return this.api.put(`/${resource}`, { data: data }).pipe(map((response: StrapiResponse<T>) => {
      return { id: response.data.id, ...response.data.attributes };
    }));
  }

  /**
   * Deletes a resource from the Strapi API.
   * 
   * @param resource The resource to delete.
   * @returns An observable of the deleted resource data.
   */
  public delete<T>(resource: string): Observable<T> {
    return this.api.delete(`/${resource}`).pipe(map((response: StrapiResponse<T>) => {
      return { id: response.data.id, ...response.data.attributes };
    }));
  }
}
