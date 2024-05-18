import { Player } from "./player";
import { Trainer } from "./trainer";

export interface Team {
    id: number;
    name: string;
    players: Player[],
    trainers: Trainer[],
    uuid?: string;
  }
  