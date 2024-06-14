import { PaginatedData } from "./data";
import { Media } from "./media";
import { Player } from "./player";

/**
 * Interface representing a user.
 */
export interface User {
    /**
     * The unique identifier of the user (optional).
     */
    id?: number;

    /**
     * The email of the user.
     */
    email: string;

    /**
     * The name of the user.
     */
    name: string;

    /**
     * The nickname of the user (optional).
     */
    nickname?: string;

    /**
     * The URL of the user's picture (optional).
     */
    picture?: string | undefined;

    /**
     * The unique UUID of the user (optional).
     */
    uuid?: string;

    /**
     * Indicates if the user is an admin.
     */
    isAdmin: boolean;

    /**
     * Indicates if the user is an owner.
     */
    isOwner: boolean;
}

/**
 * Type alias for paginated users data.
 */
export type PaginatedUsers = PaginatedData<User>;
