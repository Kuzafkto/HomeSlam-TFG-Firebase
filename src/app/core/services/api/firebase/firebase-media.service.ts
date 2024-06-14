import { Observable } from "rxjs";
import { MediaService } from "../media.service";
import { FirebaseService } from "../../firebase/firebase.service";
import { error, info } from "console";
import { Media } from "src/app/core/interfaces/media";

/**
 * Service to handle media operations using Firebase.
 */
export class FirebaseMediaService extends MediaService {

    /**
     * Creates an instance of FirebaseMediaService.
     * 
     * @param firebase Service to interact with Firebase.
     */
    constructor(
        private firebase: FirebaseService
    ) {
        super();
    }

    /**
     * Uploads a media file to Firebase.
     * 
     * @param blob The media file as a Blob.
     * @returns An observable of the uploaded media.
     */
    public upload(blob: Blob): Observable<Media[]> {
        return new Observable(obs => {
            this.firebase.imageUpload(blob).then(data => {
                var imgs = [];
                var media: Media = {
                    id: 0,
                    url_large: data.file,
                    url_medium: data.file,
                    url_thumbnail: data.file,
                    url_small: data.file
                };
                imgs.push(media);
                obs.next(imgs);
            }).catch(error => obs.error(error));
        });
    }
}
