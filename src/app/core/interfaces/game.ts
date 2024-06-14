import { Team } from "./team";

/**
 * Interface representing a game.
 */
export interface Game {
    /**
     * The date of the game.
     */
    gameDate: Date;

    /**
     * The local team.
     */
    local: Team;

    /**
     * The number of runs scored by the local team.
     */
    localRuns: number;

    /**
     * The story or description of the game.
     */
    story: string;

    /**
     * The visiting team.
     */
    visitor: Team;

    /**
     * The number of runs scored by the visiting team.
     */
    visitorRuns: number;

    /**
     * The unique identifier of the game.
     */
    uuid?: string;
}
