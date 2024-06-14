import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Abstract class that provides a contract for HTTP client providers.
 * Classes extending this abstract class must implement the specified methods for handling HTTP requests.
 */
@Injectable({ providedIn: 'root' })
export abstract class HttpClientProvider {

    /**
     * Abstract method to get an image from the provided URL.
     *
     * @param url HTTP request URL
     * @returns Observable with HTTP response as Blob
     */
    public abstract getImage(url: string): Observable<Blob>;

    /**
     * Abstract method to make a GET request.
     *
     * @param url HTTP request URL
     * @param params HTTP request parameters
     * @param headers HTTP request headers
     * @returns Observable with HTTP response of type T
     */
    public abstract get<T>(url: string, params: any, headers: any): Observable<T>;

    /**
     * Abstract method to make a POST request.
     *
     * @param url HTTP request URL
     * @param body HTTP request body
     * @param headers HTTP request headers
     * @param urlEncoded HTTP request as URL encoded content-type
     * @returns Observable with HTTP response of type T
     */
    public abstract post<T>(url: string, body: any, headers: any, urlEncoded?: boolean): Observable<T>;

    /**
     * Abstract method to make a PUT request.
     *
     * @param url HTTP request URL
     * @param body HTTP request body
     * @param headers HTTP request headers
     * @param urlEncoded HTTP request as URL encoded content-type
     * @returns Observable with HTTP response of type T
     */
    public abstract put<T>(url: string, body: any, headers: any, urlEncoded?: boolean): Observable<T>;

    /**
     * Abstract method to make a PATCH request.
     *
     * @param url HTTP request URL
     * @param body HTTP request body
     * @param headers HTTP request headers
     * @param urlEncoded HTTP request as URL encoded content-type
     * @returns Observable with HTTP response of type T
     */
    public abstract patch<T>(url: string, body: any, headers: any, urlEncoded?: boolean): Observable<T>;

    /**
     * Abstract method to make a DELETE request.
     *
     * @param url HTTP request URL
     * @param params HTTP request parameters
     * @param headers HTTP request headers
     * @returns Observable with HTTP response of type T
     */
    public abstract delete<T>(url: string, params: any, headers: any): Observable<T>;

    /**
     * Abstract method to set the trust mode for the server.
     * 
     * @param mode Server trust mode
     */
    public abstract setServerTrustMode(mode: 'default' | 'nocheck' | 'pinned' | 'legacy'): void;
}
