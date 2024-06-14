import { NumberSymbol } from "@angular/common";
import { Media } from "./media";

/**
 * Interface representing a player.
 */
export interface Player {
    /**
     * The name of the player.
     */
    name: string;

    /**
     * The positions the player can play, represented by an array of position IDs.
     */
    positions: number[];

    /**
     * The media object representing the player's image (optional).
     */
    imageUrl?: Media | undefined;

    /**
     * The unique identifier of the player (optional).
     */
    uuid?: string;
}

/**
 * Interface representing a position.
 */
export interface Position {
    /**
     * The unique identifier of the position.
     */
    id: number;

    /**
     * The name of the position.
     */
    name: "firstBase" | "secondBase" | "thirdBase" | "pitcher" | "catcher" | "shortstop" | "leftField" | "centerField" | "rightField" | "designatedHitter";
}
