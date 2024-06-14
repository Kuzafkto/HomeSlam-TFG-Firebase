import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * This abstract service handles media-related operations. It should be extended by other services to implement specific media handling logic.
 */
@Injectable({
    providedIn: 'root'
})
export abstract class MediaService {  
    
    /**
     * Uploads a media file.
     * 
     * @param blob The media file as a Blob.
     * @returns An observable of the uploaded media.
     */
    public abstract upload(blob: Blob): Observable<any[]>;
}
