import { Team } from "./team";

export interface Game {
    gameDate: Date;
    local:Team,
    localRuns: number;
    story: string;
    visitor: Team,
    visitorRuns: number,
    uuid?: string;
  }
  