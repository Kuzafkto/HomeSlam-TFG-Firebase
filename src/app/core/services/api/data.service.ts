import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedData } from '../../interfaces/data';

/**
 * This abstract service handles data operations. It should be extended by other services to implement specific data management logic.
 */
@Injectable({
  providedIn: 'root'
})
export abstract class DataService {

  /**
   * Queries the specified resource with the given parameters.
   * 
   * @param resource The resource to query.
   * @param params The query parameters.
   * @returns An observable of the paginated data.
   */
  public abstract query<T>(resource: string, params: any): Observable<PaginatedData<T>>;

  /**
   * Retrieves a specific resource.
   * 
   * @param resource The resource to retrieve.
   * @returns An observable of the resource.
   */
  public abstract get<T>(resource: string): Observable<T>;

  /**
   * Creates a new resource with the given data.
   * 
   * @param resource The resource to create.
   * @param data The data to create the resource with.
   * @returns An observable of the created resource.
   */
  public abstract post<T>(resource: string, data: any): Observable<T>;

  /**
   * Updates a specific resource with the given data.
   * 
   * @param resource The resource to update.
   * @param data The data to update the resource with.
   * @param documentName The name of the document to update (optional).
   * @returns An observable of the updated resource.
   */
  public abstract put<T>(resource: string, data: any, documentName?: string): Observable<T>;

  /**
   * Deletes a specific resource.
   * 
   * @param resource The resource to delete.
   * @returns An observable of the deleted resource.
   */
  public abstract delete<T>(resource: string): Observable<T>;
}
