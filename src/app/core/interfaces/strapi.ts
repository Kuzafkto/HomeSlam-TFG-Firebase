/**
 * Interface representing a Strapi user.
 */
export interface StrapiUser {
  /**
   * The unique identifier of the user.
   */
  id: number;

  /**
   * The username of the user.
   */
  username: string;

  /**
   * The email of the user.
   */
  email: string;
}

/**
 * Interface representing the payload for Strapi login.
 */
export interface StrapiLoginPayload {
  /**
   * The identifier (username or email) of the user.
   */
  identifier: string;

  /**
   * The password of the user.
   */
  password: string;
}

/**
 * Interface representing the payload for Strapi registration.
 */
export interface StrapiRegisterPayload {
  /**
   * The email of the user.
   */
  email: string;

  /**
   * The password of the user.
   */
  password: string;

  /**
   * The username of the user.
   */
  username: string;
}

/**
 * Interface representing the response from Strapi login.
 */
export interface StrapiLoginResponse {
  /**
   * The JWT token.
   */
  jwt: string;

  /**
   * The user details.
   */
  user: StrapiUser;
}

/**
 * Interface representing an extended Strapi user.
 */
export interface StrapiExtendedUser {
  /**
   * The data object containing extended user details.
   */
  data: {
    /**
     * The name of the user.
     */
    name: string;

    /**
     * The surname of the user.
     */
    surname: string;

    /**
     * The user permissions identifier.
     */
    users_permissions_user: number;

    /**
     * The array of player identifiers associated with the user.
     */
    players: number[];

    /**
     * The array of team identifiers associated with the user.
     */
    teams: number[];

    /**
     * The array of trainer identifiers associated with the user.
     */
    trainers: number[];
  };
}

/**
 * Interface representing a generic Strapi data object.
 *
 * @template T The type of data being represented.
 */
export interface StrapiData<T> {
  /**
   * The unique identifier of the data object.
   */
  id: number;

  /**
   * The attributes of the data object.
   */
  attributes: T;
}

/**
 * Interface representing a response from Strapi that includes an array of data objects.
 *
 * @template T The type of data being represented.
 */
export interface StrapiArrayResponse<T> {
  /**
   * The array of data objects.
   */
  data: StrapiData<T>[];

  /**
   * Meta information about the response.
   */
  meta: {
    /**
     * Pagination details (optional).
     */
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Interface representing a response from Strapi that includes a single data object.
 *
 * @template T The type of data being represented.
 */
export interface StrapiResponse<T> {
  /**
   * The data object.
   */
  data: StrapiData<T>;
}

/**
 * Type alias for the current Strapi user.
 */
export type StrapiMe = StrapiUser;

/**
 * Type alias for the response from Strapi registration.
 */
export type StrapiRegisterResponse = StrapiLoginResponse;

/**
 * Interface representing an extended Strapi user.
 */
export interface StrapiExtendedUser {
  /**
   * The unique identifier of the extended user (optional).
   */
  id?: number;

  /**
   * The name of the user.
   */
  name: string;

  /**
   * The surname of the user.
   */
  surname: string;

  /**
   * The user ID.
   */
  user_id: number;

  /**
   * The nickname of the user (optional).
   */
  nickname?: string;

  /**
   * The picture of the user (optional).
   */
  picture?: {
    /**
     * The data object containing the media details.
     */
    data: StrapiData<StrapiMedia>;
  };
}

/**
 * Type alias for the response from Strapi media upload.
 */
export type StrapiUploadResponse = StrapiMedia[];

/**
 * Interface representing a Strapi media object.
 */
export interface StrapiMedia {
  /**
   * The unique identifier of the media.
   */
  id: number;

  /**
   * The name of the media.
   */
  name: string;

  /**
   * Alternative text for the media.
   */
  alternativeText: any;

  /**
   * Caption for the media.
   */
  caption: any;

  /**
   * The width of the media.
   */
  width: number;

  /**
   * The height of the media.
   */
  height: number;

  /**
   * The different formats of the media.
   */
  formats: Formats;

  /**
   * The hash of the media.
   */
  hash: string;

  /**
   * The extension of the media.
   */
  ext: string;

  /**
   * The MIME type of the media.
   */
  mime: string;

  /**
   * The size of the media.
   */
  size: number;

  /**
   * The URL of the media.
   */
  url: string;

  /**
   * The preview URL of the media (optional).
   */
  previewUrl: any;

  /**
   * The provider of the media.
   */
  provider: string;

  /**
   * Provider metadata for the media.
   */
  provider_metadata: ProviderMetadata;

  /**
   * The creation date of the media.
   */
  createdAt: string;

  /**
   * The last update date of the media.
   */
  updatedAt: string;
}

/**
 * Interface representing the different formats of a media object.
 */
export interface Formats {
  /**
   * The large format of the media.
   */
  large: MediaFormat;

  /**
   * The small format of the media.
   */
  small: MediaFormat;

  /**
   * The medium format of the media.
   */
  medium: MediaFormat;

  /**
   * The thumbnail format of the media.
   */
  thumbnail: MediaFormat;
}

/**
 * Interface representing a specific format of a media object.
 */
export interface MediaFormat {
  /**
   * The file extension of the media.
   */
  ext: string;

  /**
   * The URL of the media.
   */
  url: string;

  /**
   * The hash of the media.
   */
  hash: string;

  /**
   * The MIME type of the media.
   */
  mime: string;

  /**
   * The name of the media.
   */
  name: string;

  /**
   * The path of the media (optional).
   */
  path: any;

  /**
   * The size of the media.
   */
  size: number;

  /**
   * The width of the media.
   */
  width: number;

  /**
   * The height of the media.
   */
  height: number;

  /**
   * Provider metadata for the media.
   */
  provider_metadata: ProviderMetadata;
}

/**
 * Interface representing provider metadata for a media object.
 */
export interface ProviderMetadata {
  /**
   * The public ID of the media.
   */
  public_id: string;

  /**
   * The resource type of the media.
   */
  resource_type: string;
}
