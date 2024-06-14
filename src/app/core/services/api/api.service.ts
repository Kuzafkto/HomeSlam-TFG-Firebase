import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { HttpClientProvider } from '../http/http-client.provider';
import { JwtService } from '../jwt.service';

/**
 * This service handles API requests to the backend.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * Creates an instance of ApiService.
   * 
   * @param http The HTTP client provider.
   * @param jwt The JWT service for handling tokens.
   */
  constructor(
    private http: HttpClientProvider,
    private jwt: JwtService
  ) {}

  /**
   * Gets the headers for an API request.
   * 
   * @param url The URL for the request.
   * @param accept The Accept header value (optional).
   * @param contentType The Content-Type header value (optional).
   * @returns The headers object.
   */
  getHeader(url: string, accept: string | null = null, contentType: string | null = null): any {
    var header: any = {};
    if (accept) {
      header['Accept'] = accept;
    }
    if (contentType) {
      header['Content-Type'] = contentType;
    }
    if (!url.includes('auth')) {
      header['Authorization'] = `Bearer ${this.jwt.getToken()}`;
    }
    return header;
  }

  /**
   * Gets an image from the given URL.
   * 
   * @param url The URL of the image.
   * @returns An observable of the image.
   */
  getImage(url: string): Observable<any> {
    return this.http.getImage(url);
  }

  /**
   * Gets data from a given URL.
   * 
   * @param url The URL to get data from.
   * @returns An observable of the data.
   */
  getDataFromUrl(url: string): Observable<any> {
    return this.http.get(url, {}, this.getHeader(url));
  }

  /**
   * Gets data from the API.
   * 
   * @param path The API endpoint path.
   * @param params The query parameters (optional).
   * @returns An observable of the data.
   */
  get(path: string, params: any = {}): Observable<any> {
    var url = `${environment.apiUrl}${path}`;
    return this.http.get(url, params, this.getHeader(url));
  }

  /**
   * Updates data via a PUT request to the API.
   * 
   * @param path The API endpoint path.
   * @param body The request body.
   * @returns An observable of the response.
   */
  put(path: string, body: Object = {}): Observable<any> {
    var url = `${environment.apiUrl}${path}`;
    return this.http.put(url, body, this.getHeader(url));
  }

  /**
   * Creates data via a POST request to the API.
   * 
   * @param path The API endpoint path.
   * @param body The request body.
   * @param contentType The Content-Type header value (optional).
   * @returns An observable of the response.
   */
  post(path: string, body: Object = {}, contentType: string | null = null): Observable<any> {
    var url = `${environment.apiUrl}${path}`;
    return this.http.post(url, body, this.getHeader(url));
  }

  /**
   * Updates data via a PATCH request to the API.
   * 
   * @param path The API endpoint path.
   * @param body The request body.
   * @returns An observable of the response.
   */
  patch(path: string, body: Object = {}): Observable<any> {
    var url = `${environment.apiUrl}${path}`;
    return this.http.patch(url, body, this.getHeader(url));
  }

  /**
   * Deletes data via a DELETE request to the API.
   * 
   * @param path The API endpoint path.
   * @param params The query parameters (optional).
   * @returns An observable of the response.
   */
  delete(path: string, params: Object = {}): Observable<any> {
    var url = `${environment.apiUrl}${path}`;
    return this.http.delete(url, params, this.getHeader(url));
  }
}
