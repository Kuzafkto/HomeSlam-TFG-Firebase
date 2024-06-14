/**
 * Interface representing media details.
 */
export interface Media {
    /**
     * The unique identifier of the media.
     */
    id: number;

    /**
     * The URL of the small-sized version of the media.
     */
    url_small: string;

    /**
     * The URL of the medium-sized version of the media.
     */
    url_medium: string;

    /**
     * The URL of the large-sized version of the media.
     */
    url_large: string;

    /**
     * The URL of the thumbnail version of the media.
     */
    url_thumbnail: string;
}
