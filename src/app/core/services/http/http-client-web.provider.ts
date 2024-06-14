import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientProvider } from './http-client.provider';

/**
 * Injectable provider for making HTTP requests using Angular's HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class HttpClientWebProvider extends HttpClientProvider {

  /**
   * Creates an instance of HttpClientWebProvider.
   *
   * @param httpClient Angular HTTP client
   */
  constructor(private readonly httpClient: HttpClient) {
    super();
  }

  /**
   * Fetches an image as a Blob.
   *
   * @param url HTTP request URL
   * @returns Observable with HTTP response as Blob
   */
  public getImage(url: string): Observable<Blob> {
    return this.httpClient.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Sends a GET request.
   *
   * @param url HTTP request URL
   * @param params HTTP request parameters
   * @param headers HTTP request headers
   * @returns Observable with HTTP response of type T
   */
  public get<T>(url: string, params: any = {}, headers: any = {}): Observable<T> {
    return this.httpClient.get<T>(url, {
      params: new HttpParams({ fromObject: params }),
      headers: this.createHeaders(headers)
    });
  }

  /**
   * Sends a POST request.
   *
   * @param url HTTP request URL
   * @param body HTTP request body
   * @param headers HTTP request headers
   * @param urlEncoded HTTP request as URL encoded content-type
   * @returns Observable with HTTP response of type T
   */
  public post<T>(url: string, body: any = {}, headers: any = {}, urlEncoded: boolean = false): Observable<T> {
    return this.httpClient.post<T>(url, this.createBody(body, urlEncoded), {
      headers: this.createHeaders(headers, urlEncoded)
    });
  }

  /**
   * Sends a PUT request.
   *
   * @param url HTTP request URL
   * @param body HTTP request body
   * @param headers HTTP request headers
   * @param urlEncoded HTTP request as URL encoded content-type
   * @returns Observable with HTTP response of type T
   */
  public put<T>(url: string, body: any = {}, headers: any = {}, urlEncoded: boolean = false): Observable<T> {
    return this.httpClient.put<T>(url, this.createBody(body, urlEncoded), {
      headers: this.createHeaders(headers, urlEncoded)
    });
  }

  /**
   * Sends a PATCH request.
   *
   * @param url HTTP request URL
   * @param body HTTP request body
   * @param headers HTTP request headers
   * @param urlEncoded HTTP request as URL encoded content-type
   * @returns Observable with HTTP response of type T
   */
  public patch<T>(url: string, body: any = {}, headers: any = {}, urlEncoded: boolean = false): Observable<T> {
    if (body instanceof FormData) {
      return this.httpClient.patch<T>(url, body, { headers: headers });
    } else {
      return this.httpClient.patch<T>(url, this.createBody(body, urlEncoded), {
        headers: this.createHeaders(headers, urlEncoded)
      });
    }
  }

  /**
   * Sends a DELETE request.
   *
   * @param url HTTP request URL
   * @param params HTTP request parameters
   * @param headers HTTP request headers
   * @returns Observable with HTTP response of type T
   */
  public delete<T>(url: string, params: any = {}, headers: any = {}): Observable<T> {
    return this.httpClient.delete<T>(url, {
      params: new HttpParams({ fromObject: params }),
      headers: this.createHeaders(headers)
    });
  }

  /**
   * Sets the server trust mode.
   *
   * @param mode Server trust mode
   */
  public setServerTrustMode(mode: 'default' | 'nocheck' | 'pinned' | 'legacy'): void { }

  /**
   * Creates HTTP headers.
   *
   * @param headers HTTP headers
   * @param urlEncoded HTTP request as URL encoded content-type
   * @returns Angular HTTP headers
   */
  private createHeaders(headers: any, urlEncoded: boolean = false): HttpHeaders {
    let _headers = new HttpHeaders(headers);
    if (urlEncoded) {
      _headers = _headers.set('Accept', 'application/x-www-form-urlencoded');
    }
    return _headers;
  }

  /**
   * Creates HTTP request body.
   *
   * @param body HTTP request body
   * @param urlEncoded HTTP request as URL encoded content-type
   * @returns HTTP request body or HTTP parameters
   */
  private createBody(body: any, urlEncoded: boolean): any | HttpParams {
    return urlEncoded ? new HttpParams({ fromObject: body }) : body;
  }
}
