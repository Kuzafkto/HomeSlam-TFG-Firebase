import { Media } from "./media";
import { Player } from "./player";
import { Trainer } from "./trainer";

/**
 * Interface representing a team.
 */
export interface Team {
    /**
     * The story or description of the team.
     */
    story: string;

    /**
     * The media object representing the team's image (optional).
     */
    imageUrl?: Media | undefined;

    /**
     * The name of the team.
     */
    name: string;

    /**
     * The array of players in the team.
     */
    players: Player[];

    /**
     * The array of trainers in the team.
     */
    trainers: Trainer[];

    /**
     * The unique identifier of the team (optional).
     */
    uuid?: string;
}
